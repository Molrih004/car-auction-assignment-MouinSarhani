import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Same rules in every service: the recommended JavaScript and TypeScript rules, so mistakes are found before a merge
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'src/generated/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      // Express needs the 4 arguments of an error handler, even when one is not used
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Needed to add req.user to the Express Request type
      '@typescript-eslint/no-namespace': 'off',
    },
  },
);
