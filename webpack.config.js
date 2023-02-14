const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/sw.js',
  },
  output: {
    path: path.resolve(__dirname, 'extension'),
    filename: 'sw.js',
  },
  plugins: [
    new CopyPlugin({
      patterns: ['./src/manifest.json'],
    }),
  ],
}
