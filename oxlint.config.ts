import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['eslint', 'typescript', 'oxc', 'unicorn', 'react', 'jsx-a11y'],
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  settings: {
    react: {
      version: '18.3.1',
    },
  },
  ignorePatterns: ['build/**', 'node_modules/**', 'src/*Points.json'],
  rules: {
    'react/no-unknown-property': 'off',
    'react/no-unescaped-entities': 'off',
    'react/purity': 'off',
    'react/refs': 'off',
    'react/set-state-in-effect': 'off',
  },
});
