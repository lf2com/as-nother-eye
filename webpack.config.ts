import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { Configuration as WebpackConfig } from 'webpack';
import { Configuration as WebpackDevServerConfig } from 'webpack-dev-server';

const distPath = path.resolve(__dirname, 'dist');

export default (env: any, options: any): WebpackConfig & WebpackDevServerConfig => {
  const isProduction = options.mode === 'production';
  const isDevToPublic = true;
  // const isDevToPublic = (
  //   !isProduction
  //   && env.public !== undefined
  //   && !/^false$/.test(env.public)
  // );

  return {
    entry: path.resolve(__dirname, 'src/index.tsx'),
    mode: isProduction ? 'production' : 'development',
    optimization: {
      usedExports: true,
    },
    output: {
      filename: '[name].[contenthash].js',
      path: distPath,
      clean: true,
      publicPath: '/',
    },
    target: ['web'],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/env',
                '@babel/react',
                '@babel/typescript',
              ],
            },
          },
        },
        {
          test: /\.s?css$/,
          use: [
            'style-loader',
            'css-modules-typescript-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[local]_[hash:base64:5]',
                },
              },
            },
            'sass-loader',
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
    ],
    devtool: 'inline-source-map',
    devServer: {
      https: true,
      host: isDevToPublic ? 'local-ip' : 'localhost',
      // host: '192.168.1.105',
      // host: '192.168.2.107',
      port: 8080,
      compress: true,
      open: '/',
      hot: true,
      historyApiFallback: true,
      client: {
        progress: true,
        overlay: {
          warnings: false,
        },
      },
      static: {
        watch: true,
        directory: distPath,
        publicPath: '/',
        serveIndex: true,
      },
    },
  };
};
