import Student from '../../models/student';

// Default required fields for all student tests
const requiredFields = {
  ellStatus: 'Active ELL',
  compositeLevel: 'Intermediate',
  designation: 'ELL',
};

describe('Student Model', () => {
  describe('Validation', () => {
    it('should create a valid student with required fields', async () => {
      const student = await Student.create({
        fullName: 'Test Student',
        ...requiredFields,
      });

      expect(student._id).toBeDefined();
      expect(student.fullName).toBe('Test Student');
      expect(student.active).toBe(true); // Default value
    });

    it('should create student with all fields', async () => {
      const student = await Student.create({
        fullName: 'Complete Student',
        school: 'Test Elementary',
        teacher: 'Ms. Teacher',
        dateOfBirth: new Date('2012-06-15'),
        gender: 'Female',
        race: 'Asian',
        gradeLevel: '4',
        nativeLanguage: 'Vietnamese',
        cityOfBirth: 'Ho Chi Minh City',
        countryOfBirth: 'Vietnam',
        ellStatus: 'Active ELL',
        compositeLevel: 'Intermediate',
        active: true,
        designation: 'ELL',
      });

      expect(student.fullName).toBe('Complete Student');
      expect(student.school).toBe('Test Elementary');
      expect(student.gradeLevel).toBe('4');
      expect(student.ellStatus).toBe('Active ELL');
    });

    it('should require fullName', async () => {
      await expect(
        Student.create({
          school: 'Test School',
          ...requiredFields,
        })
      ).rejects.toThrow('Full name is required');
    });

    it('should require ellStatus', async () => {
      await expect(
        Student.create({
          fullName: 'Test Student',
          compositeLevel: 'Intermediate',
          designation: 'ELL',
        })
      ).rejects.toThrow('ELL status is required');
    });

    it('should require compositeLevel', async () => {
      await expect(
        Student.create({
          fullName: 'Test Student',
          ellStatus: 'Active ELL',
          designation: 'ELL',
        })
      ).rejects.toThrow('Composite level is required');
    });

    it('should require designation', async () => {
      await expect(
        Student.create({
          fullName: 'Test Student',
          ellStatus: 'Active ELL',
          compositeLevel: 'Intermediate',
        })
      ).rejects.toThrow('Designation is required');
    });

    it('should trim fullName whitespace', async () => {
      const student = await Student.create({
        fullName: '  Trimmed Name  ',
        ...requiredFields,
      });

      expect(student.fullName).toBe('Trimmed Name');
    });

    it('should reject fullName exceeding max length', async () => {
      const longName = 'A'.repeat(101);

      await expect(
        Student.create({
          fullName: longName,
          ...requiredFields,
        })
      ).rejects.toThrow('cannot exceed 100 characters');
    });
  });

  describe('Enum Validations', () => {
    describe('gradeLevel', () => {
      const validGrades = [
        'Pre-K',
        'K',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
      ];

      it('should accept valid grade levels', async () => {
        for (const grade of validGrades) {
          const student = await Student.create({
            fullName: `Grade ${grade} Student`,
            gradeLevel: grade,
            ...requiredFields,
          });

          expect(student.gradeLevel).toBe(grade);
        }
      });

      it('should reject invalid grade level', async () => {
        await expect(
          Student.create({
            fullName: 'Invalid Grade Student',
            gradeLevel: 'InvalidGrade',
            ...requiredFields,
          })
        ).rejects.toThrow('Grade level must be one of');
      });
    });

    describe('ellStatus', () => {
      const validStatuses = [
        'Active ELL',
        'Exited',
        'Monitoring',
        'Never ELL',
        'Refused Services',
      ];

      it('should accept valid ELL statuses', async () => {
        for (const status of validStatuses) {
          const student = await Student.create({
            fullName: `${status} Student`,
            ellStatus: status,
            compositeLevel: 'Intermediate',
            designation: 'ELL',
          });

          expect(student.ellStatus).toBe(status);
        }
      });

      it('should reject invalid ELL status', async () => {
        await expect(
          Student.create({
            fullName: 'Invalid Status Student',
            ellStatus: 'InvalidStatus',
            compositeLevel: 'Intermediate',
            designation: 'ELL',
          })
        ).rejects.toThrow('ELL status must be one of');
      });
    });

    describe('compositeLevel', () => {
      const validLevels = [
        'Beginning',
        'Early Intermediate',
        'Intermediate',
        'Early Advanced',
        'Advanced',
        'Proficient',
      ];

      it('should accept valid composite levels', async () => {
        for (const level of validLevels) {
          const student = await Student.create({
            fullName: `${level} Student`,
            compositeLevel: level,
            ellStatus: 'Active ELL',
            designation: 'ELL',
          });

          expect(student.compositeLevel).toBe(level);
        }
      });

      it('should reject invalid composite level', async () => {
        await expect(
          Student.create({
            fullName: 'Invalid Level Student',
            compositeLevel: 'InvalidLevel',
            ellStatus: 'Active ELL',
            designation: 'ELL',
          })
        ).rejects.toThrow('Composite level must be one of');
      });
    });

    describe('designation', () => {
      const validDesignations = ['ELL', 'RFEP', 'IFEP', 'EO', 'TBD'];

      it('should accept valid designations', async () => {
        for (const designation of validDesignations) {
          const student = await Student.create({
            fullName: `${designation} Student`,
            designation: designation,
            ellStatus: 'Active ELL',
            compositeLevel: 'Intermediate',
          });

          expect(student.designation).toBe(designation);
        }
      });

      it('should reject invalid designation', async () => {
        await expect(
          Student.create({
            fullName: 'Invalid Designation Student',
            designation: 'InvalidDesignation',
            ellStatus: 'Active ELL',
            compositeLevel: 'Intermediate',
          })
        ).rejects.toThrow('Designation must be one of');
      });
    });

    describe('gender', () => {
      const validGenders = [
        'Male',
        'Female',
        'Non-binary',
        'Other',
        'Prefer not to say',
      ];

      it('should accept valid genders', async () => {
        for (const gender of validGenders) {
          const student = await Student.create({
            fullName: `${gender} Student`,
            gender: gender,
            ...requiredFields,
          });

          expect(student.gender).toBe(gender);
        }
      });

      it('should reject invalid gender', async () => {
        await expect(
          Student.create({
            fullName: 'Invalid Gender Student',
            gender: 'InvalidGender',
            ...requiredFields,
          })
        ).rejects.toThrow('Gender must be one of');
      });
    });
  });

  describe('Max Length Validations', () => {
    it('should reject school name exceeding max length', async () => {
      await expect(
        Student.create({
          fullName: 'Test Student',
          school: 'A'.repeat(151),
          ...requiredFields,
        })
      ).rejects.toThrow('School name cannot exceed 150 characters');
    });

    it('should reject teacher name exceeding max length', async () => {
      await expect(
        Student.create({
          fullName: 'Test Student',
          teacher: 'A'.repeat(101),
          ...requiredFields,
        })
      ).rejects.toThrow('Teacher name cannot exceed 100 characters');
    });

    it('should reject city exceeding max length', async () => {
      await expect(
        Student.create({
          fullName: 'Test Student',
          cityOfBirth: 'A'.repeat(101),
          ...requiredFields,
        })
      ).rejects.toThrow('City cannot exceed 100 characters');
    });

    it('should reject country exceeding max length', async () => {
      await expect(
        Student.create({
          fullName: 'Test Student',
          countryOfBirth: 'A'.repeat(101),
          ...requiredFields,
        })
      ).rejects.toThrow('Country cannot exceed 100 characters');
    });

    it('should reject language exceeding max length', async () => {
      await expect(
        Student.create({
          fullName: 'Test Student',
          nativeLanguage: 'A'.repeat(51),
          ...requiredFields,
        })
      ).rejects.toThrow('Language cannot exceed 50 characters');
    });
  });

  describe('Date of Birth Validation', () => {
    it('should accept valid date of birth', async () => {
      const student = await Student.create({
        fullName: 'Valid DOB Student',
        dateOfBirth: new Date('2010-05-15'),
        ...requiredFields,
      });

      expect(student.dateOfBirth).toEqual(new Date('2010-05-15'));
    });

    it('should reject future date of birth', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await expect(
        Student.create({
          fullName: 'Future Student',
          dateOfBirth: futureDate,
          ...requiredFields,
        })
      ).rejects.toThrow('Date of birth must be between 1900 and today');
    });

    it('should reject date before 1900', async () => {
      await expect(
        Student.create({
          fullName: 'Ancient Student',
          dateOfBirth: new Date('1899-12-31'),
          ...requiredFields,
        })
      ).rejects.toThrow('Date of birth must be between 1900 and today');
    });
  });

  describe('Default Values', () => {
    it('should set active to true by default', async () => {
      const student = await Student.create({
        fullName: 'Default Active Student',
        ...requiredFields,
      });

      expect(student.active).toBe(true);
    });

    it('should allow setting active to false', async () => {
      const student = await Student.create({
        fullName: 'Inactive Student',
        active: false,
        ...requiredFields,
      });

      expect(student.active).toBe(false);
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const beforeCreate = new Date();

      const student = await Student.create({
        fullName: 'Timestamp Student',
        ...requiredFields,
      });

      const afterCreate = new Date();

      expect(student.createdAt).toBeDefined();
      expect(student.updatedAt).toBeDefined();
      expect(student.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(student.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });
  });

  describe('Indexes', () => {
    it('should have indexes defined', async () => {
      const indexes = Student.schema.indexes();

      // Check for expected indexes
      const indexFields = indexes.map((idx) => Object.keys(idx[0]));

      expect(indexFields).toContainEqual(['createdAt']);
      expect(indexFields).toContainEqual(['school']);
      expect(indexFields).toContainEqual(['gradeLevel']);
      expect(indexFields).toContainEqual(['ellStatus']);
      expect(indexFields).toContainEqual(['active']);
      expect(indexFields).toContainEqual(['school', 'gradeLevel']);
      expect(indexFields).toContainEqual(['fullName']);
    });
  });
});
