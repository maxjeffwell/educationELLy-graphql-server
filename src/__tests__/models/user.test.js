import User from '../../models/user';

describe('User Model', () => {
  describe('Validation', () => {
    it('should create a valid user', async () => {
      const user = await User.create({
        email: 'valid@example.com',
        password: 'ValidPass123!',
      });

      expect(user._id).toBeDefined();
      expect(user.email).toBe('valid@example.com');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should require email', async () => {
      await expect(
        User.create({
          password: 'ValidPass123!',
        })
      ).rejects.toThrow();
    });

    it('should require password', async () => {
      await expect(
        User.create({
          email: 'test@example.com',
        })
      ).rejects.toThrow();
    });

    it('should reject invalid email format', async () => {
      await expect(
        User.create({
          email: 'invalid-email',
          password: 'ValidPass123!',
        })
      ).rejects.toThrow('valid email');
    });

    it('should reject email exceeding max length', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';

      await expect(
        User.create({
          email: longEmail,
          password: 'ValidPass123!',
        })
      ).rejects.toThrow();
    });

    it('should reject weak passwords', async () => {
      // Too short
      await expect(
        User.create({
          email: 'short@example.com',
          password: 'Short1!',
        })
      ).rejects.toThrow('Password');

      // Missing uppercase
      await expect(
        User.create({
          email: 'nouppercase@example.com',
          password: 'lowercase123!',
        })
      ).rejects.toThrow('Password');

      // Missing lowercase
      await expect(
        User.create({
          email: 'nolowercase@example.com',
          password: 'UPPERCASE123!',
        })
      ).rejects.toThrow('Password');

      // Missing number
      await expect(
        User.create({
          email: 'nonumber@example.com',
          password: 'NoNumberHere!',
        })
      ).rejects.toThrow('Password');

      // Missing special character
      await expect(
        User.create({
          email: 'nospecial@example.com',
          password: 'NoSpecial123',
        })
      ).rejects.toThrow('Password');
    });

    it('should accept strong passwords', async () => {
      const user = await User.create({
        email: 'strongpass@example.com',
        password: 'StrongP@ss123!',
      });

      expect(user).toBeDefined();
    });

    it('should enforce unique email', async () => {
      await User.create({
        email: 'unique@example.com',
        password: 'ValidPass123!',
      });

      await expect(
        User.create({
          email: 'unique@example.com',
          password: 'AnotherPass123!',
        })
      ).rejects.toThrow();
    });

    it('should trim email whitespace', async () => {
      const user = await User.create({
        email: '  trimmed@example.com  ',
        password: 'ValidPass123!',
      });

      expect(user.email).toBe('trimmed@example.com');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password on save', async () => {
      const user = await User.create({
        email: 'hashed@example.com',
        password: 'PlainText123!',
      });

      expect(user.password).not.toBe('PlainText123!');
      expect(user.password.startsWith('$2a$') || user.password.startsWith('$2b$')).toBe(true);
    });

    it('should validate correct password', async () => {
      const user = await User.create({
        email: 'validate@example.com',
        password: 'CorrectPass123!',
      });

      const isValid = await user.validatePassword('CorrectPass123!');
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await User.create({
        email: 'reject@example.com',
        password: 'CorrectPass123!',
      });

      const isValid = await user.validatePassword('WrongPass123!');
      expect(isValid).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should find user by email using findByLogin', async () => {
      await User.create({
        email: 'findme@example.com',
        password: 'FindMe123!',
      });

      const user = await User.findByLogin('findme@example.com');

      expect(user).toBeDefined();
      expect(user.email).toBe('findme@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await User.findByLogin('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt on creation', async () => {
      const beforeCreate = new Date();

      const user = await User.create({
        email: 'timestamps@example.com',
        password: 'TimeStamp123!',
      });

      const afterCreate = new Date();

      expect(user.createdAt).toBeDefined();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });

    it('should update updatedAt on save', async () => {
      const user = await User.create({
        email: 'update@example.com',
        password: 'Update123!',
      });

      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      user.email = 'updated@example.com';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });
});
