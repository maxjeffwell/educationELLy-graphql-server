import mongoose from 'mongoose';
import models from './src/models/index.js';

const { User, Student } = models;

const MONGODB_URI = 'mongodb+srv://maxjeffwell2:73Xs0YWE@educationelly-db-graphq.xmgkwdh.mongodb.net/?retryWrites=true&w=majority';

const sampleUsers = [
  {
    email: 'admin@educationelly.com',
    password: 'admin123'
  },
  {
    email: 'teacher@educationelly.com',
    password: 'teacher123'
  },
  {
    email: 'user@educationelly.com',
    password: 'user123456'
  },
  {
    email: 'demo@demo.example',
    password: 'demopassword'
  }
];

const sampleStudents = [
  {
    fullName: 'Maria Rodriguez',
    school: 'Lincoln Elementary',
    teacher: 'Ms. Johnson',
    dateOfBirth: new Date('2012-03-15'),
    gender: 'Female',
    race: 'Hispanic',
    gradeLevel: '5th Grade',
    nativeLanguage: 'Spanish',
    cityOfBirth: 'Austin',
    countryOfBirth: 'USA',
    ellStatus: 'Beginning',
    compositeLevel: 'Level 1',
    active: true,
    designation: 'ELL'
  },
  {
    fullName: 'Ahmed Hassan',
    school: 'Roosevelt Middle School',
    teacher: 'Mr. Smith',
    dateOfBirth: new Date('2010-07-22'),
    gender: 'Male',
    race: 'Middle Eastern',
    gradeLevel: '7th Grade',
    nativeLanguage: 'Arabic',
    cityOfBirth: 'Dallas',
    countryOfBirth: 'USA',
    ellStatus: 'Intermediate',
    compositeLevel: 'Level 3',
    active: true,
    designation: 'ELL'
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
    cityOfBirth: 'Houston',
    countryOfBirth: 'USA',
    ellStatus: 'Advanced',
    compositeLevel: 'Level 4',
    active: true,
    designation: 'ELL'
  },
  {
    fullName: 'Jean-Pierre Dubois',
    school: 'Franklin Elementary',
    teacher: 'Ms. Wilson',
    dateOfBirth: new Date('2013-01-30'),
    gender: 'Male',
    race: 'White',
    gradeLevel: '4th Grade',
    nativeLanguage: 'French',
    cityOfBirth: 'San Antonio',
    countryOfBirth: 'USA',
    ellStatus: 'Beginning',
    compositeLevel: 'Level 2',
    active: true,
    designation: 'ELL'
  },
  {
    fullName: 'Priya Patel',
    school: 'Jefferson Middle School',
    teacher: 'Mr. Brown',
    dateOfBirth: new Date('2011-05-12'),
    gender: 'Female',
    race: 'Asian',
    gradeLevel: '6th Grade',
    nativeLanguage: 'Hindi',
    cityOfBirth: 'Fort Worth',
    countryOfBirth: 'USA',
    ellStatus: 'Intermediate',
    compositeLevel: 'Level 3',
    active: true,
    designation: 'ELL'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    console.log('Cleared existing data');

    // Seed users
    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Seed students
    const createdStudents = await Student.create(sampleStudents);
    console.log(`Created ${createdStudents.length} students`);

    console.log('Database seeding completed successfully!');
    
    // Display created data for verification
    console.log('\n--- Created Users ---');
    createdUsers.forEach(user => {
      console.log(`Email: ${user.email}, ID: ${user._id}`);
    });

    console.log('\n--- Created Students ---');
    createdStudents.forEach(student => {
      console.log(`Name: ${student.fullName}, School: ${student.school}, Grade: ${student.gradeLevel}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();