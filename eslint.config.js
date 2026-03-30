const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const globals = require('globals');
const security = require('eslint-plugin-security');
const nodePlugin = require('eslint-plugin-n');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  // Global ignores
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/build/**', '**/.next/**', 'services/frontend/**'],
  },

  // Base config for all JS files
  js.configs.recommended,

  // Airbnb base via FlatCompat bridge
  ...compat.extends('airbnb-base'),

  // Security plugin (native flat config)
  security.configs.recommended,

  // Node.js recommended rules
  nodePlugin.configs['flat/recommended-script'],

  // Prettier must be last to disable conflicting rules
  ...compat.extends('prettier'),

  // Shared settings for all JS files
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-console': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'func-names': 'off',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off',
      'security/detect-object-injection': 'off',

      // Node.js rules
      'n/no-process-exit': 'warn',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-missing-require': 'off',
      'n/no-unpublished-require': 'off',
    },
  },

  // Allow devDependencies in config files and test files
  {
    files: ['*.config.js', 'commitlint.config.js', 'eslint.config.js', '**/tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },

  // Jest rules for test files
  ...compat.extends('plugin:jest/recommended').map((config) => ({
    ...config,
    files: ['**/tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
  })),
  {
    files: ['**/tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'jest/expect-expect': 'off',
    },
  },
];
