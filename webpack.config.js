const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    loaders: [
      {
        test: /\.spec.js$/,
        include: [path.resolve(__dirname, 'src')],
        loaders: ['mocha'],
      },
    ],
  },
};
