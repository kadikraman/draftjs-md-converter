module.exports = {
  extends: 'airbnb',
  env: {
    mocha: true,
    node: true
  },
  rules: {
    strict: 0,
    'comma-dangle': 0
  },
  ecmaFeatures: {
    experimentalObjectRestSpread: true
  },
};
