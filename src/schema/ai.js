import { gql } from 'graphql-tag';

export default gql`
  extend type Query {
    """
    Check AI Gateway health status
    """
    aiHealth: AIHealth!
  }

  extend type Mutation {
    """
    Generate personalized study recommendations for a student
    """
    generateStudyRecommendations(
      gradeLevel: Int!
      compositeLevel: String
      ellStatus: String
      nativeLanguage: String
    ): StudyRecommendations!

    """
    Generate educational flashcard
    """
    generateFlashcard(
      topic: String!
      content: String!
      gradeLevel: Int
    ): Flashcard!

    """
    Generate quiz questions
    """
    generateQuiz(
      topic: String!
      difficulty: String
      count: Int
      gradeLevel: Int
    ): Quiz!

    """
    Multi-turn conversational chat for educational help
    """
    chat(
      messages: [ChatMessageInput!]!
      context: ChatContextInput
    ): ChatResponse!
  }

  input ChatMessageInput {
    role: String!
    content: String!
  }

  input ChatContextInput {
    app: String
    userRole: String
    gradeLevel: Int
    ellStatus: String
    nativeLanguage: String
    studentId: ID
  }

  type ChatResponse {
    success: Boolean!
    response: String!
    model: String
    backend: String
  }

  type AIHealth {
    success: Boolean!
    gateway: GatewayHealth
    error: String
  }

  type GatewayHealth {
    status: String!
    gateway: String
    backend: BackendHealth
  }

  type BackendHealth {
    status: String
    model_loaded: Boolean
  }

  type StudyRecommendations {
    success: Boolean!
    recommendations: String!
    student: StudentContext!
  }

  type StudentContext {
    gradeLevel: Int!
    compositeLevel: String
    ellStatus: String
  }

  type Flashcard {
    success: Boolean!
    topic: String!
    question: String!
    answer: String!
    gradeLevel: Int
  }

  type Quiz {
    success: Boolean!
    topic: String!
    difficulty: String!
    gradeLevel: Int
    count: Int!
    questions: [QuizQuestion!]!
  }

  type QuizQuestion {
    question: String!
    answer: String!
  }
`;
