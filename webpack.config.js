const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const WebpackBarPlugin = require('webpackbar')
const Dotenv = require('dotenv-webpack')

module.exports = {
  mode: 'production',
  entry: {
    index: path.resolve(__dirname, './src/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [
      {
        // 拡張子 .ts の場合
        test: /\.ts$/,
        // TypeScript をコンパイルする
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.resolve(__dirname, 'src'), './node_modules'],
    plugins: [
      new TsconfigPathsPlugin({
        // tsconfig.json はデフォルト
        configFile: 'tsconfig.json',
      }),
    ],
  },
  target: 'node',
  externals: [],
  stats: 'errors-only',
  plugins: [
    new WebpackBarPlugin({
      color: '#228be6',
    }),
    new Dotenv(),
  ],
}
