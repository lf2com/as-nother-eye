export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  coverageProvider: 'babel',
  moduleDirectories: [
    'node_modules',
  ],
  preset: 'ts-jest',
  resetModules: true,
  rootDir: '.',
  roots: [
    '<rootDir>/src',
  ],
  slowTestThreshold: 5,
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  watchPathIgnorePatterns: [],
  watchman: true,
};
