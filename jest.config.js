   /** @type {import('ts-jest').JestConfigWithTsJest} */
   module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: [
      '/node_modules/',
      '/.next/',
      '/dist/'
    ],
    projects: [
      {
        displayName: 'api',
        testEnvironment: 'node',
        testMatch: ['**/app/api/**/*.test.ts'],
        setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
        moduleNameMapper: {
          '^@/(.*)$': '<rootDir>/$1',
          '^@components/(.*)$': '<rootDir>/app/components/$1',
          '^@ui/(.*)$': '<rootDir>/app/components/ui/$1',
        },
        globals: {
          'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
            isolatedModules: true,
          },
        },
        moduleDirectories: ['node_modules', '<rootDir>/'],
      },
      {
        displayName: 'ui',
        testEnvironment: 'jsdom',
        testMatch: ['**/app/**/__tests__/**/*.test.tsx'],
        setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
        moduleNameMapper: {
          '^@/(.*)$': '<rootDir>/$1',
          '^@components/(.*)$': '<rootDir>/app/components/$1',
          '^@ui/(.*)$': '<rootDir>/app/components/ui/$1',
        },
        globals: {
          'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
            isolatedModules: true,
          },
        },
        moduleDirectories: ['node_modules', '<rootDir>/'],
      },
  ],
};