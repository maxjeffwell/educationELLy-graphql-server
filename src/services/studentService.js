import {
  ValidationError,
  NotFoundError,
  handleMongooseError,
} from './errors';

// ObjectId validation regex
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Student Service
 * Handles student CRUD operations
 */
class StudentService {
  /**
   * Validate ObjectId format
   * @param {string} id - ID to validate
   * @throws {ValidationError} If ID format is invalid
   */
  validateObjectId(id) {
    if (!id || !OBJECT_ID_REGEX.test(id)) {
      throw new ValidationError('Invalid student ID format');
    }
  }

  /**
   * Filter null/undefined values from input
   * @param {Object} input - Input object
   * @returns {Object} Filtered object
   */
  filterInput(input) {
    return Object.fromEntries(
      Object.entries(input).filter(
        ([, value]) => value !== null && value !== undefined
      )
    );
  }

  /**
   * Get all students
   * @param {Object} models - Mongoose models
   * @param {Object} options - Query options (filters, pagination)
   * @returns {Promise<Array>} List of students
   */
  async findAll(models, options = {}) {
    const { filter = {}, limit, skip, sort = { createdAt: -1 } } = options;

    let query = models.Student.find(filter);

    if (sort) query = query.sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);

    return query;
  }

  /**
   * Find student by ID
   * @param {string} id - Student ID
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object|null>} Student or null
   */
  async findById(id, models) {
    return models.Student.findById(id);
  }

  /**
   * Find students by filter
   * @param {Object} filter - MongoDB filter
   * @param {Object} models - Mongoose models
   * @returns {Promise<Array>} Matching students
   */
  async findByFilter(filter, models) {
    return models.Student.find(filter);
  }

  /**
   * Count students matching filter
   * @param {Object} filter - MongoDB filter
   * @param {Object} models - Mongoose models
   * @returns {Promise<number>} Count
   */
  async count(filter, models) {
    return models.Student.countDocuments(filter);
  }

  /**
   * Create a new student
   * @param {Object} input - Student data
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object>} Created student
   */
  async create(input, models) {
    try {
      return await models.Student.create(input);
    } catch (error) {
      handleMongooseError(error);
    }
  }

  /**
   * Update an existing student
   * @param {string} id - Student ID
   * @param {Object} input - Fields to update
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object>} Updated student
   * @throws {NotFoundError} If student not found
   */
  async update(id, input, models) {
    try {
      // Filter out null/undefined values
      const filteredInput = this.filterInput(input);

      const student = await models.Student.findByIdAndUpdate(
        id,
        { $set: filteredInput },
        { new: true, runValidators: true }
      );

      if (!student) {
        throw new NotFoundError('Student not found');
      }

      return student;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      handleMongooseError(error);
    }
  }

  /**
   * Delete a student
   * @param {string} id - Student ID
   * @param {Object} models - Mongoose models
   * @returns {Promise<boolean>} True if deleted
   * @throws {ValidationError} If ID format invalid
   * @throws {NotFoundError} If student not found
   */
  async deleteStudent(id, models) {
    // Validate ID format
    this.validateObjectId(id);

    const student = await models.Student.findById(id);

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    await models.Student.findOneAndDelete({ _id: id });
    return true;
  }

  /**
   * Search students by name (text search)
   * @param {string} searchTerm - Search term
   * @param {Object} models - Mongoose models
   * @returns {Promise<Array>} Matching students
   */
  async searchByName(searchTerm, models) {
    return models.Student.find(
      { $text: { $search: searchTerm } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
  }

  /**
   * Get students by school
   * @param {string} school - School name
   * @param {Object} models - Mongoose models
   * @returns {Promise<Array>} Students at school
   */
  async findBySchool(school, models) {
    return models.Student.find({ school }).sort({ fullName: 1 });
  }

  /**
   * Get students by ELL status
   * @param {string} ellStatus - ELL status
   * @param {Object} models - Mongoose models
   * @returns {Promise<Array>} Students with status
   */
  async findByEllStatus(ellStatus, models) {
    return models.Student.find({ ellStatus }).sort({ createdAt: -1 });
  }

  /**
   * Get active students
   * @param {Object} models - Mongoose models
   * @returns {Promise<Array>} Active students
   */
  async findActive(models) {
    return models.Student.find({ active: true }).sort({ createdAt: -1 });
  }

  /**
   * Toggle student active status
   * @param {string} id - Student ID
   * @param {Object} models - Mongoose models
   * @returns {Promise<Object>} Updated student
   */
  async toggleActive(id, models) {
    const student = await models.Student.findById(id);

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    student.active = !student.active;
    await student.save();

    return student;
  }
}

// Export singleton instance
export const studentService = new StudentService();
export default studentService;
