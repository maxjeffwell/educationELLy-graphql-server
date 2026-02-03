import { userService } from '../services';
import { withErrorHandling } from '../utils/graphqlErrors';

export default {
  Query: {
    users: withErrorHandling(
      async (parent, args, { models }) => {
        return userService.findAll(models);
      }
    ),

    user: withErrorHandling(
      async (parent, { _id }, { models }) => {
        return userService.findById(_id, models);
      }
    ),

    me: withErrorHandling(
      async (parent, args, { models, me }) => {
        return userService.getCurrentUser(me, models);
      }
    ),
  },

  Mutation: {
    signUp: withErrorHandling(
      async (parent, { email, password }, { models, setAuthCookie }) => {
        const { user, token } = await userService.register(email, password, models);

        // Set httpOnly cookie for authentication
        setAuthCookie(token);

        return { success: true, user };
      }
    ),

    signIn: withErrorHandling(
      async (parent, { login, password }, { models, setAuthCookie }) => {
        const { user, token } = await userService.authenticate(login, password, models);

        // Set httpOnly cookie for authentication
        setAuthCookie(token);

        return { success: true, user };
      }
    ),

    signOut: (parent, args, { clearAuthCookie }) => {
      // Clear the httpOnly authentication cookie
      clearAuthCookie();
      return true;
    },
  },
};
