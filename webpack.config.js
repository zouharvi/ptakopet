const path = require('path');
var webpack = require("webpack");

module.exports = (env, argv) => {
   return {
      entry: './src/main.ts',
      devtool: 'inline-source-map',
      module: {
         rules: [
            {
               test: /\.tsx?$/,
               use: 'ts-loader',
               exclude: /node_modules/
            }
         ]
      },
      resolve: {
         extensions: ['.tsx', '.ts', '.js']
      },
      output: {
         filename: 'ptakopet-web.js',
         path: path.resolve(__dirname, 'web')
      },
      devServer: {
         contentBase: path.join(__dirname, 'web'),
         compress: true,
         port: 9000,
      },
      plugins: [
         new webpack.DefinePlugin({
            DEVMODE: !!(argv.mode == 'development')
         })
      ]
   }
};