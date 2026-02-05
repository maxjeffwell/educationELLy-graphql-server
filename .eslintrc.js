module.exports = {
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    node: true,
    es2022: true,
    mocha: true,
    jest: true,
  },
  rules: {
    // Allow console for server-side logging
    'no-console': ['error', { allow: ['log', 'error', 'warn'] }],
    
    // Relaxed rules for GraphQL/MongoDB project
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-underscore-dangle': 'off', // Allow _id for MongoDB
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off', // Simplified for deployment
    'arrow-parens': 'off',
    'implicit-arrow-linebreak': 'off',
    'function-paren-newline': 'off',
    'no-return-await': 'off',
    'no-confusing-arrow': 'off',
    'consistent-return': 'off',
    'prefer-destructuring': 'off',
    'comma-dangle': 'off',
    'no-trailing-spaces': 'warn',
    'no-multiple-empty-lines': 'warn',
    'eol-last': 'warn',
    
    // Test files
    'no-unused-expressions': 'off', // For chai assertions
    'func-names': 'off', // Allow anonymous functions in tests
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '.nyc_output/',
    '*.log',
    'logs/',
    'test-results/',
    'tmp/',
    'temp/',
  ],
};