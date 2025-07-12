import { GraphQLError } from 'graphql';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new GraphQLError('You are not authenticated as a user', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  });

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me: { role } }) =>
    role === 'ADMIN'
      ? skip
      : new GraphQLError('You are not authorized as an administrator', {
          extensions: {
            code: 'FORBIDDEN',
          },
        }),
);
