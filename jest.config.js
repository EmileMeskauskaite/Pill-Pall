module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '@babel/preset-react'
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  collectCoverageFrom: [
    'src/components/**/*.jsx',
    'src/components/buttons/**/*.jsx',
    'src/components/notifications/**/*.jsx',
    '!src/components/forms/**/*.jsx', // Exclude forms directory for now
    '!src/pages/**/*.jsx', // Exclude pages directory for now
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 70,
      functions: 50,
      lines: 50
    },
    'src/components/': {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    },
    'src/components/notifications/': {
      statements: 90,
      branches: 90, 
      functions: 90,
      lines: 90
    },
    'src/components/buttons/': {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
}; 