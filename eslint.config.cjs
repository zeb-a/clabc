module.exports = [
  // Ignore common generated folders (android build outputs, release bundles)
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "android/**", "release/**"]
  },

  // Basic rules for JS/JSX files using a minimal rule set
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      // Keep this minimal to avoid blocking; enforce some useful defaults
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],

      // Turn off rules that reference plugins not configured in this minimal flat config
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off'
    }
  }
];
