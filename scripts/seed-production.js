import mongoose from 'mongoose';
import 'dotenv/config.js';

// Import models
import User from '../src/models/user.js';
import Student from '../src/models/student.js';

const seedDatabase = async () => {
  try {
    // Connect to production database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    console.log('✅ Cleared existing data');

    // Seed Users
    console.log('Seeding users...');
    const users = [
      {
        email: 'admin@educationelly.com',
        password: 'admin123',
      },
      {
        email: 'teacher1@school.edu',
        password: 'teacher123',
      },
      {
        email: 'teacher2@school.edu', 
        password: 'teacher123',
      },
      {
        email: 'coordinator@district.org',
        password: 'coord123',
      },
      {
        email: 'demo@example.com',
        password: 'demopassword',
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);

    // Seed Students
    console.log('Seeding students...');
    const students = [
      {
        fullName: 'Maria Rodriguez',
        school: 'Lincoln Elementary School',
        teacher: 'Ms. Johnson',
        dateOfBirth: new Date('2014-03-15'),
        gender: 'Female',
        race: 'Hispanic',
        gradeLevel: '3rd Grade',
        nativeLanguage: 'Spanish',
        cityOfBirth: 'Mexico City',
        countryOfBirth: 'Mexico',
        ellStatus: 'Beginning',
        compositeLevel: 'Level 1',
        designation: 'ELL',
        active: true,
      },
      {
        fullName: 'Ahmed Hassan',
        school: 'Roosevelt Middle School',
        teacher: 'Mr. Smith',
        dateOfBirth: new Date('2012-07-22'),
        gender: 'Male',
        race: 'Middle Eastern',
        gradeLevel: '6th Grade',
        nativeLanguage: 'Arabic',
        cityOfBirth: 'Cairo',
        countryOfBirth: 'Egypt',
        ellStatus: 'Intermediate',
        compositeLevel: 'Level 3',
        designation: 'ELL',
        active: true,
      },
      {
        fullName: 'Li Wei',
        school: 'Washington High School',
        teacher: 'Mrs. Davis',
        dateOfBirth: new Date('2008-11-08'),
        gender: 'Female',
        race: 'Asian',
        gradeLevel: '9th Grade',
        nativeLanguage: 'Mandarin',
        cityOfBirth: 'Beijing',
        countryOfBirth: 'China',
        ellStatus: 'Advanced',
        compositeLevel: 'Level 4',
        designation: 'ELL',
        active: true,
      },
      {
        fullName: 'Jean Baptiste',
        school: 'Kennedy Elementary School',
        teacher: 'Ms. Wilson',
        dateOfBirth: new Date('2015-01-12'),
        gender: 'Male',
        race: 'Black',
        gradeLevel: '2nd Grade',
        nativeLanguage: 'French',
        cityOfBirth: 'Port-au-Prince',
        countryOfBirth: 'Haiti',
        ellStatus: 'Beginning',
        compositeLevel: 'Level 1',
        designation: 'ELL',
        active: true,
      },
      {
        fullName: 'Fatima Al-Zahra',
        school: 'Jefferson Middle School',
        teacher: 'Mr. Brown',
        dateOfBirth: new Date('2011-09-30'),
        gender: 'Female',
        race: 'Middle Eastern',
        gradeLevel: '7th Grade',
        nativeLanguage: 'Arabic',
        cityOfBirth: 'Damascus',
        countryOfBirth: 'Syria',
        ellStatus: 'Intermediate',
        compositeLevel: 'Level 2',
        designation: 'ELL',
        active: true,
      },
      {
        fullName: 'Carlos Mendoza',
        school: 'Adams High School',
        teacher: 'Mrs. Garcia',
        dateOfBirth: new Date('2007-05-18'),
        gender: 'Male',
        race: 'Hispanic',
        gradeLevel: '10th Grade',
        nativeLanguage: 'Spanish',
        cityOfBirth: 'Guatemala City',
        countryOfBirth: 'Guatemala',
        ellStatus: 'Advanced',
        compositeLevel: 'Level 4',
        designation: 'Former ELL',
        active: true,
      },
      {
        fullName: 'Priya Sharma',
        school: 'Lincoln Elementary School',
        teacher: 'Ms. Johnson',
        dateOfBirth: new Date('2014-12-05'),
        gender: 'Female',
        race: 'Asian',
        gradeLevel: '3rd Grade',
        nativeLanguage: 'Hindi',
        cityOfBirth: 'Mumbai',
        countryOfBirth: 'India',
        ellStatus: 'Beginning',
        compositeLevel: 'Level 1',
        designation: 'ELL',
        active: true,
      },
      {
        fullName: 'Viktor Petrov',
        school: 'Roosevelt Middle School',
        teacher: 'Mr. Smith',
        dateOfBirth: new Date('2013-02-14'),
        gender: 'Male',
        race: 'White',
        gradeLevel: '5th Grade',
        nativeLanguage: 'Russian',
        cityOfBirth: 'Moscow',
        countryOfBirth: 'Russia',
        ellStatus: 'Intermediate',
        compositeLevel: 'Level 3',
        designation: 'ELL',
        active: true,
      },
      {
        fullName: 'Amara Okafor',
        school: 'Washington High School',
        teacher: 'Mrs. Davis',
        dateOfBirth: new Date('2009-08-27'),
        gender: 'Female',
        race: 'Black',
        gradeLevel: '8th Grade',
        nativeLanguage: 'Igbo',
        cityOfBirth: 'Lagos',
        countryOfBirth: 'Nigeria',
        ellStatus: 'Advanced',
        compositeLevel: 'Level 4',
        designation: 'ELL',
        active: true,
      },
      {
        fullName: 'Kai Tanaka',
        school: 'Kennedy Elementary School',
        teacher: 'Ms. Wilson',
        dateOfBirth: new Date('2016-04-09'),
        gender: 'Male',
        race: 'Asian',
        gradeLevel: '1st Grade',
        nativeLanguage: 'Japanese',
        cityOfBirth: 'Tokyo',
        countryOfBirth: 'Japan',
        ellStatus: 'Beginning',
        compositeLevel: 'Level 1',
        designation: 'ELL',
        active: true,
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log(`✅ Created ${createdStudents.length} students`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Students: ${createdStudents.length}`);
    console.log(`   Total records: ${createdUsers.length + createdStudents.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
seedDatabase();