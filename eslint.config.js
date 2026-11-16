import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    // Architecture guard: the simulation layer is pure TypeScript.
    files: ['src/simulation/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['react', 'react-dom', 'react/*', 'three', 'three/*'], message: 'Simulation must not import React or Three.js.' },
            { group: ['**/engine/**', '**/ui/**'], message: 'Simulation must not import engine or UI modules.' },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        'window', 'document', 'navigator', 'localStorage', 'requestAnimationFrame', 'performance',
      ],
    },
  },
);
