import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

const createToken = async (user, secret, expiresIn) => {
  const { _id, email } = user;
  return await jwt.sign({ id: _id, email }, secret, {
    expiresIn,
  });
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
    signUp: async (parent, { email, password }, { models, secret }) => {
      const user = await models.User.create({ email, password });
      return { token: createToken(user, secret, '1d') };
    },

    signIn: async (parent, { login, password }, { models, secret }
    ) => {
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

      return { token: createToken(user, secret, '1d') };
    },
  },
};
