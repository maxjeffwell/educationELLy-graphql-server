import axios from 'axios';

const API_URL = 'http://localhost:8000/graphql';

export const signIn = async variables =>
  await axios.post(API_URL, {
    query: `
      mutation ($login: String!, $password: String!) {
        signIn(login: $login, password: $password) {
          token
        }
      }
    `,
    variables,
  });

export const me = async token =>
  await axios.post(
    API_URL,
    {
      query: `
        {
          me {
            _id
            email
            createdAt
            updatedAt
          }
        }
      `,
    },
    token
      ? {
        headers: {
          'x-token': token,
        },
      }
      : null
  );

export const user = async variables =>
  axios.post(API_URL, {
    query: `
      query ($_id: ID!) {
        user(_id: $_id) {
          _id
          email
          createdAt
          updatedAt
        }
      }
    `,
    variables,
  });

export const users = async () =>
  axios.post(API_URL, {
    query: `
      {
        users {
          _id
          email
          createdAt
          updatedAt
        }
      }
    `,
  });

export const signUp = async variables =>
  axios.post(API_URL, {
    query: `
      mutation($email: String!, $password: String!) {
        signUp(email: $email, password: $password) {
          token
        }
      }
    `,
    variables,
  });

// Student API functions
export const students = async (token) =>
  axios.post(
    API_URL,
    {
      query: `
        {
          students {
            _id
            fullName
            school
            teacher
            dateOfBirth
            gender
            race
            gradeLevel
            nativeLanguage
            cityOfBirth
            countryOfBirth
            ellStatus
            compositeLevel
            active
            designation
            createdAt
            updatedAt
          }
        }
      `,
    },
    token
      ? {
        headers: {
          'x-token': token,
        },
      }
      : null
  );

export const student = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        query ($_id: ID!) {
          student(_id: $_id) {
            _id
            fullName
            school
            teacher
            dateOfBirth
            gender
            race
            gradeLevel
            nativeLanguage
            cityOfBirth
            countryOfBirth
            ellStatus
            compositeLevel
            active
            designation
            createdAt
            updatedAt
          }
        }
      `,
      variables,
    },
    token
      ? {
        headers: {
          'x-token': token,
        },
      }
      : null
  );

export const createStudent = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($input: NewStudentInput!) {
          createStudent(input: $input) {
            _id
            fullName
            school
            teacher
            ellStatus
            active
          }
        }
      `,
      variables,
    },
    token
      ? {
        headers: {
          'x-token': token,
        },
      }
      : null
  );

export const updateStudent = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($_id: ID!, $input: UpdateStudentInput!) {
          updateStudent(_id: $_id, input: $input) {
            _id
            fullName
            school
            teacher
            ellStatus
            active
            updatedAt
          }
        }
      `,
      variables,
    },
    token
      ? {
        headers: {
          'x-token': token,
        },
      }
      : null
  );

export const deleteStudent = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($_id: ID!) {
          deleteStudent(_id: $_id)
        }
      `,
      variables,
    },
    token
      ? {
        headers: {
          'x-token': token,
        },
      }
      : null
  );
