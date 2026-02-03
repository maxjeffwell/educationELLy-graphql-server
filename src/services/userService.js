import {
  AuthenticationError,
  NotFoundError,
  handleMongooseError,
} from './errors';
import { authService } from './authService';

/**
 * User Service
 * Handles user CRUD operations and authentication
 */
class UserService {
  /**
   * Get all users
   * @param {Object} models - Mongoose models
   * @returns {Promise<Array>} List of users
   */
  async findAll(models) {
    return models.User.find();
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object|null>} User or null
   */
  async findById(id, models) {
    return models.User.findById(id);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email, models) {
    return models.User.findByLogin(email);
  }

  /**
   * Get current authenticated user
   * @param {Object} me - Authenticated user from context
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object|null>} User or null
   */
  async getCurrentUser(me, models) {
    if (!me) {
      return null;
    }
    return models.User.findById(me.id);
  }

  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object>} Created user and token
   */
  async register(email, password, models) {
    try {
      const user = await models.User.create({ email, password });
      const token = authService.createToken(user);

      return { user, token };
    } catch (error) {
      handleMongooseError(error);
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object>} Authenticated user and token
   * @throws {AuthenticationError} If credentials are invalid
   */
  async authenticate(email, password, models) {
    const user = await this.findByEmail(email, models);

    if (!user) {
      throw new AuthenticationError('You have entered invalid login credentials');
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new AuthenticationError('You have entered invalid login credentials');
    }

    const token = authService.createToken(user);

    return { user, token };
  }

  /**
   * Update user profile
   * @param {string} id - User ID
   * @param {Object} updates - Fields to update
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object>} Updated user
   * @throws {NotFoundError} If user not found
   */
  async update(id, updates, models) {
    try {
      const user = await models.User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      handleMongooseError(error);
    }
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @param {Object} models - Mongoose models
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If user not found
   */
  async deleteUser(id, models) {
    const user = await models.User.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await models.User.findOneAndDelete({ _id: id });
    return true;
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
