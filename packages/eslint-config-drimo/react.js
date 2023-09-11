module.exports = {
  extends: ['./index', './rules/react', './rules/hooks'].map(require.resolve),
  plugins: ['react', 'react-hooks'],
  env: {
    browser: true,
  },
  settings: {
    react: {
      version: '18',
    },
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    quotes: ['warn', 'single', { avoidEscape: true }],
    curly: 'off',
    'max-lines-per-function': ['warn', 300],
  },
}
