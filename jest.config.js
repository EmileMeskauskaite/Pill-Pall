module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 82,
      branches: 77,
      functions: 88,
      lines: 82
    }
  },
  testTimeout: 20000, // Increase timeout for tests if needed
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!**/jest.setup.js',
    '!**/db.js',
    '!**/update_db.js',
    '!**/__tests__/db.test.js',
    '!**/__tests__/update_db.test.js'
  ],
  testPathIgnorePatterns: [
    'node_modules',
    '__tests__/db.test.js',
    '__tests__/update_db.test.js'
  ]
}; 