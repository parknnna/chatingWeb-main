const path = require('path')
const Dotenv = require('dotenv-webpack');
module.exports = env => {
  return {
    entry: path.join(__dirname, 'front/src/index.js'),
    output: {
      path: path.join(__dirname, 'public/build/public/'),
      filename: 'bundle.js',
    },
    devtool: 'inline-source-map',
    plugins: [
      new Dotenv()
    ],
    mode: 'development',
    resolve: {
      extensions: ['.js', '.jsx', '.ts'],
    },
    module: {
      rules: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          options: {
            "presets": [
              "@babel/preset-env", "@babel/preset-react"
            ],
          }
        },
        {
          test: /\.(png|jpg|gif)$/i,
          use: [
            {
              loader: 'url-loader',
            },
          ]
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ]
    }
  }
}

