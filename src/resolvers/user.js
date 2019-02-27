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

    user: async (parent, { id }, { models }) => {
      if (mongoose.Schema.Types.ObjectId.isValid(id)) {
        return await models.User.findById(id, function(err, doc) {
          if (err) {
            reject(err);
          } else if (doc) {
            resolve({ success: true, data: doc });
          } else {
            reject({ success: false, data: "No data exists for the user with that id" });
          }
        });
      } else {
        reject({ success: false, data: "Please provide the correct id" });
      }
    },

    me: async (parent, args, { models, me }) => {
      if (!me) {
        return null;
      }
        return await models.User.findById(me.id);
      }
    },

  Mutation: {
    signUp: async (parent, { email, password }, { models, secret },) => {
      const user = await models.User.create({input});
      return { token: createToken(user, secret, '1d') };
    },

    signIn: async (parent, { login, password }, { models, secret },
    ) => {
      const user = await models.User.findByLogin(login);
      if (!user) {
        throw new UserInputError(
          'You entered invalid login credentials',
        );
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError('You entered invalid login credentials');
      }

      return { token: createToken(user, secret, '1d') };
    },
  },
};
