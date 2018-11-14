const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src/public/js/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'src/public/dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/transform-runtime']
          }
        }
      }
    ]
  }
}