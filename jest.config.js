module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-mmkv|zustand)',
  ],
  moduleNameMapper: {
    // Real in-memory SQLite (node:sqlite) + in-memory MMKV so repositories,
    // migrations and stores run for real inside jest (user-scenario fuzz).
    '^expo-sqlite$': '<rootDir>/src/test/mocks/expoSqliteMock.ts',
    '^react-native-mmkv$': '<rootDir>/src/test/mocks/mmkvMock.ts',
    '^expo-secure-store$': '<rootDir>/src/test/mocks/secureStoreMock.ts',
    '^expo-crypto$': '<rootDir>/src/test/mocks/expoCryptoMock.ts',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@storage/(.*)$': '<rootDir>/src/storage/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
  setupFiles: [],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/index.ts'],
};
