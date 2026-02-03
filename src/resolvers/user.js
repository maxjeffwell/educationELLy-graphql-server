import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

// JWT secret kept in module scope for security (not exposed in GraphQL context)
const JWT_SECRET = process.env.JWT_SECRET;

// Token expiration (configurable via environment)
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '1d';

const createToken = (user, expiresIn) => {
  const { _id, email } = user;
  return jwt.sign({ id: _id, email }, JWT_SECRET, { expiresIn });
};

export default {
  Query: {
    users: async (parent, args, { models }) => await models.User.find(),

    user: async (parent, { _id }, { models }) => await models.User.findById(_id).exec(),

    me: async (parent, args, { models, me }) => {
      if (!me) {
        return null;
      }
      return await models.User.findById(me.id);
    },
  },

  Mutation: {
    signUp: async (parent, { email, password }, { models, setAuthCookie }) => {
      try {
        const user = await models.User.create({ email, password });

        // Create token and set httpOnly cookie
        const token = createToken(user, TOKEN_EXPIRY);
        setAuthCookie(token);

        return { success: true, user };
      } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors)
            .map((e) => e.message)
            .join('. ');
          throw new GraphQLError(messages, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        // Handle duplicate email error
        if (error.code === 11000) {
          throw new GraphQLError('An account with this email already exists', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        throw error;
      }
    },

    signIn: async (parent, { login, password }, { models, setAuthCookie }) => {
      const user = await models.User.findByLogin(login);
      if (!user) {
        throw new GraphQLError(
          'You have entered invalid login credentials',
          {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          }
        );
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new GraphQLError('You have entered invalid login credentials', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }

      // Create token and set httpOnly cookie
      const token = createToken(user, TOKEN_EXPIRY);
      setAuthCookie(token);

      return { success: true, user };
    },

    signOut: (parent, args, { clearAuthCookie }) => {
      // Clear the httpOnly authentication cookie
      clearAuthCookie();
      return true;
    },
  },
};
