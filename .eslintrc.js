module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    es6: true,
  },
  plugins: [
      '@typescript-eslint'
  ],
  extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      "plugin:prettier/recommended",
  ]
};
