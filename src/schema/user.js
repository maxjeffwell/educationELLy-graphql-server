import { gql } from 'graphql-tag';

export default gql`
  extend type Query {
    """
    Retrieve all users in the system. Requires admin privileges.
    """
    users: [User!]!

    """
    Retrieve a specific user by their unique identifier.
    """
    user(
      "The unique identifier of the user to retrieve"
      _id: ID!
    ): User

    """
    Retrieve the currently authenticated user's profile.
    Returns null if not authenticated.
    """
    me: User
  }

  extend type Mutation {
    """
    Create a new user account. Sets an httpOnly authentication cookie and returns success status.
    The cookie is automatically sent with subsequent requests when using credentials: 'include'.
    """
    signUp(
      "Valid email address (must be unique)"
      email: String!
      "Password for the account (minimum 8 characters recommended)"
      password: String!
    ): AuthPayload!

    """
    Authenticate an existing user. Sets an httpOnly authentication cookie and returns success status.
    The cookie is automatically sent with subsequent requests when using credentials: 'include'.
    """
    signIn(
      "Email address used during registration"
      login: String!
      "Account password"
      password: String!
    ): AuthPayload!

    """
    Sign out the current user by clearing the authentication cookie.
    Returns true if sign out was successful.
    """
    signOut: Boolean!
  }

  """
  Authentication response returned after successful sign-up or sign-in.
  An httpOnly cookie is automatically set for secure authentication.
  """
  type AuthPayload {
    "Whether authentication was successful"
    success: Boolean!
    "The authenticated user's information"
    user: User!
  }

  """
  @deprecated Use AuthPayload instead. Kept for backward compatibility.
  """
  type Token {
    "JWT token string (expires in 24 hours) - deprecated: use cookie-based auth"
    token: String!
  }

  """
  Represents a user account in the EducationELLy system.
  Users can manage their own students and access AI-powered educational features.
  """
  type User {
    "Unique identifier for the user"
    _id: ID!
    "User's email address (used for authentication)"
    email: String!
    "Timestamp when the user account was created"
    createdAt: Date!
    "Timestamp when the user account was last modified"
    updatedAt: Date!
  }
`;
