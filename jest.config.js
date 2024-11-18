/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  projects: [
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@components/(.*)$': '<rootDir>/app/components/$1',
        '^@ui/(.*)$': '<rootDir>/app/components/ui/$1',
      },
      collectCoverage: true,
      coverageDirectory: 'coverage/backend',
      coverageReporters: ['text', 'lcov'],
      collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        '!**/node_modules/**',
        '!**/vendor/**',
      ],
    },
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@components/(.*)$': '<rootDir>/app/components/$1',
        '^@ui/(.*)$': '<rootDir>/app/components/ui/$1',
      },
      collectCoverage: true,
      coverageDirectory: 'coverage/frontend',
      coverageReporters: ['text', 'lcov'],
      collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        '!**/node_modules/**',
        '!**/vendor/**',
      ],
    },
  ],
};