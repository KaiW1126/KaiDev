import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  eslint.configs.recommended,
  ...astroPlugin.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // JSX Accessibility
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      
      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      '.vercel/',
    ],
  },
];
