import jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError } from 'apollo-server';
import mongoose from 'mongoose';

const createToken = async (user, secret, expiresIn) => {
  const { id, email } = user;
  return await jwt.sign({ id, email }, secret, {
    expiresIn,
  });
};

export default {
  Query: {
    users: async (parent, args, { models }) => {
      return await models.User.find();
    },

    user: async (parent, { _id }, { models }) => {
      return await models.User.findById(_id).exec()
    },

    me: async (parent, args, { models, me }) => {
      if (!me) {
        return null;
      }
        return await models.User.findById(me.id);
      }
    },

  Mutation: {
    signUp: async (parent, { email, password}, { models, secret },) => {
      const user = await models.User.create({ email, password });
      return { token: createToken(user, secret, '1d') };
    },

    signIn: async (parent, { login, password }, { models, secret },
    ) => {
      const user = await models.User.findByLogin(login);
      if (!user) {
        throw new UserInputError(
          'You have entered invalid login credentials',
        );
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError('You have entered invalid login credentials');
      }

      return { token: createToken(user, secret, '1d') };
    },
  },
};
