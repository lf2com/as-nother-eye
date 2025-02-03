import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '\\w\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageProvider: 'babel',
  extensionsToTreatAsEsm: ['.tsx', '.ts'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  resetModules: true,
  rootDir: '.',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: [
    'jest-extended/all',
    '@testing-library/jest-dom',
    '@testing-library/jest-dom/jest-globals',
  ],
  slowTestThreshold: 5,
  testMatch: ['**/*.test.ts(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
