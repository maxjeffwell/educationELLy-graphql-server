import mongoose from 'mongoose';
import 'dotenv/config';

// Import models
import Student from '../src/models/student.js';

const seedStudents = async () => {
  try {
    // Connect to production database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing students
    console.log('Clearing existing students...');
    await Student.deleteMany({});
    console.log('✅ Cleared existing students');

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
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log(`✅ Created ${createdStudents.length} students`);

    console.log('\n🎉 Student seeding completed successfully!');
    console.log(`📊 Summary: ${createdStudents.length} students created`);

  } catch (error) {
    console.error('❌ Error seeding students:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
seedStudents();