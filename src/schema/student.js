import { gql } from 'graphql-tag';

export default gql`
  """
  English Language Learner program status
  """
  enum ELLStatus {
    "Currently receiving ELL services"
    ACTIVE_ELL
    "Successfully exited the ELL program"
    EXITED
    "Being monitored after exiting ELL program"
    MONITORING
    "Never identified as an English Language Learner"
    NEVER_ELL
    "Family refused ELL services"
    REFUSED_SERVICES
  }

  """
  English proficiency composite level based on assessment scores
  """
  enum CompositeLevel {
    "Lowest proficiency level"
    BEGINNING
    "Between Beginning and Intermediate"
    EARLY_INTERMEDIATE
    "Mid-level proficiency"
    INTERMEDIATE
    "Between Intermediate and Advanced"
    EARLY_ADVANCED
    "High proficiency level"
    ADVANCED
    "Fully proficient in English"
    PROFICIENT
  }

  """
  Student language program designation
  """
  enum Designation {
    "English Language Learner"
    ELL
    "Reclassified Fluent English Proficient"
    RFEP
    "Initially Fluent English Proficient"
    IFEP
    "English Only"
    EO
    "To Be Determined"
    TBD
  }

  extend type Query {
    """
    Retrieve all students belonging to the authenticated user.
    Returns an empty array if no students exist.
    """
    students: [Student!]!

    """
    Retrieve a specific student by their unique identifier.
    Only returns students belonging to the authenticated user.
    """
    student(
      "The unique identifier of the student to retrieve"
      _id: ID!
    ): Student
  }

  extend type Mutation {
    """
    Create a new student record. The student will be associated with the authenticated user.
    """
    createStudent(
      "Student information for the new record"
      input: NewStudentInput!
    ): Student!

    """
    Update an existing student's information. Only the owner can update their students.
    """
    updateStudent(
      "The unique identifier of the student to update"
      _id: ID!
      "Fields to update (only provided fields will be modified)"
      input: UpdateStudentInput!
    ): Student!

    """
    Permanently delete a student record. This action cannot be undone.
    """
    deleteStudent(
      "The unique identifier of the student to delete"
      _id: ID!
    ): Boolean!
  }

  """
  Represents an English Language Learner (ELL) student in the system.
  Contains demographic information, educational status, and language proficiency data.
  """
  type Student {
    "Unique identifier for the student"
    _id: ID!
    "Student's full legal name"
    fullName: String!
    "Name of the school the student attends"
    school: String
    "Name of the student's primary teacher"
    teacher: String
    "Student's date of birth"
    dateOfBirth: Date
    "Student's gender identity"
    gender: String
    "Student's race or ethnicity"
    race: String
    "Current grade level (e.g., 'K', '1', '2', ... '12')"
    gradeLevel: String
    "Student's native/first language (e.g., 'Spanish', 'Mandarin', 'Arabic')"
    nativeLanguage: String
    "City where the student was born"
    cityOfBirth: String
    "English Language Learner status"
    ellStatus: ELLStatus
    "Overall English proficiency composite level"
    compositeLevel: CompositeLevel
    "Whether the student is currently active in the program"
    active: Boolean
    "Student language program designation"
    designation: Designation
    "Country where the student was born"
    countryOfBirth: String
    "Timestamp when the student record was created"
    createdAt: Date!
    "Timestamp when the student record was last modified"
    updatedAt: Date!
  }

  """
  Input for updating an existing student. All fields are optional;
  only provided fields will be updated.
  """
  input UpdateStudentInput {
    "Student's full legal name"
    fullName: String
    "Name of the school the student attends"
    school: String
    "Name of the student's primary teacher"
    teacher: String
    "Student's date of birth"
    dateOfBirth: Date
    "Student's gender identity"
    gender: String
    "Student's race or ethnicity"
    race: String
    "Current grade level (e.g., 'K', '1', '2', ... '12')"
    gradeLevel: String
    "Student's native/first language"
    nativeLanguage: String
    "City where the student was born"
    cityOfBirth: String
    "English Language Learner status"
    ellStatus: ELLStatus
    "Overall English proficiency composite level"
    compositeLevel: CompositeLevel
    "Whether the student is currently active in the program"
    active: Boolean
    "Student language program designation"
    designation: Designation
    "Country where the student was born"
    countryOfBirth: String
  }

  """
  Input for creating a new student. Only fullName is required;
  other fields can be added later via updateStudent.
  """
  input NewStudentInput {
    "Student's full legal name (required)"
    fullName: String!
    "Name of the school the student attends"
    school: String
    "Name of the student's primary teacher"
    teacher: String
    "Student's date of birth"
    dateOfBirth: Date
    "Student's gender identity"
    gender: String
    "Student's race or ethnicity"
    race: String
    "Current grade level (e.g., 'K', '1', '2', ... '12')"
    gradeLevel: String
    "Student's native/first language"
    nativeLanguage: String
    "City where the student was born"
    cityOfBirth: String
    "English Language Learner status"
    ellStatus: ELLStatus
    "Overall English proficiency composite level"
    compositeLevel: CompositeLevel
    "Whether the student is currently active in the program"
    active: Boolean
    "Student language program designation"
    designation: Designation
    "Country where the student was born"
    countryOfBirth: String
  }
`;

