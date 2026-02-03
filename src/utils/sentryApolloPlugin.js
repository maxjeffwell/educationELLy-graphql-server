import * as Sentry from '@sentry/node';

/**
 * Apollo Server plugin for Sentry integration
 * Provides:
 * - Transaction tracing for GraphQL operations
 * - Error capturing with context
 * - Slow query detection
 */
export const sentryApolloPlugin = {
  async requestDidStart({ request, contextValue }) {
    // Skip introspection queries
    if (request.operationName === 'IntrospectionQuery') {
      return {};
    }

    const operationName = request.operationName || 'anonymous';
    const operationType = request.query?.includes('mutation') ? 'mutation' : 'query';

    // Start a Sentry transaction for this request
    return Sentry.startSpan(
      {
        name: `GraphQL ${operationType}: ${operationName}`,
        op: 'graphql.request',
        attributes: {
          'graphql.operation_name': operationName,
          'graphql.operation_type': operationType,
        },
      },
      async (span) => {
        return {
          async didResolveOperation({ request }) {
            // Add operation details to span
            if (span) {
              span.setAttribute('graphql.variables', JSON.stringify(request.variables || {}));
            }
          },

          async executionDidStart() {
            return {
              willResolveField({ info }) {
                const fieldPath = `${info.parentType.name}.${info.fieldName}`;
                const startTime = Date.now();

                return () => {
                  const duration = Date.now() - startTime;

                  // Log slow resolvers (>100ms) as breadcrumbs
                  if (duration > 100) {
                    Sentry.addBreadcrumb({
                      category: 'graphql.resolver',
                      message: `Slow resolver: ${fieldPath}`,
                      level: 'warning',
                      data: {
                        field: fieldPath,
                        duration: `${duration}ms`,
                      },
                    });
                  }
                };
              },
            };
          },

          async didEncounterErrors({ errors, contextValue }) {
            for (const error of errors) {
              // Skip user-facing errors
              const code = error.extensions?.code;
              if (['BAD_USER_INPUT', 'UNAUTHENTICATED', 'FORBIDDEN', 'NOT_FOUND'].includes(code)) {
                continue;
              }

              Sentry.withScope((scope) => {
                // Add GraphQL context
                scope.setTag('graphql.operation', operationName);
                scope.setTag('graphql.type', operationType);

                // Add user context if available
                if (contextValue?.me) {
                  scope.setUser({
                    id: contextValue.me.id,
                    email: contextValue.me.email,
                  });
                }

                // Add error path
                if (error.path) {
                  scope.setExtra('graphql.path', error.path.join('.'));
                }

                // Add variables (sanitized)
                const sanitizedVariables = { ...request.variables };
                if (sanitizedVariables.password) sanitizedVariables.password = '[FILTERED]';
                if (sanitizedVariables.input?.password) sanitizedVariables.input.password = '[FILTERED]';
                scope.setExtra('graphql.variables', sanitizedVariables);

                Sentry.captureException(error.originalError || error);
              });
            }
          },

          async willSendResponse({ response }) {
            // Add response status to span
            if (span && response.errors?.length > 0) {
              span.setStatus({ code: 2, message: 'error' }); // Error status
            }
          },
        };
      }
    );
  },
};

export default sentryApolloPlugin;
