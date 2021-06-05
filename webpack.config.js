const path = require('path')


// Plugins 
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const ImageminPlugin = require('imagemin-webpack-plugin').default

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsPlugin(),
      new TerserPlugin()
    ]
  }
  return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: '',
      }
    },
    'css-loader'
  ]

  if (extra) {
    loaders.push(extra)
  }

  return loaders
}

const babelLoaders = preset => {
  const options = {
    loader: "babel-loader",
    options: {
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-proposal-class-properties']
    }
  }

  if (preset) {
    options.options.presets.push(preset)
  }

  return options
}
const plugins = () => {
  const base = [
    new HTMLWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/favicon.ico'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: filename('css')
    })
  ]

  

  if (isProd) {
    const analyzer = new BundleAnalyzerPlugin()
    base.push(analyzer)
  }

  return base
}

// const jsLoader = () => {
//   const loaders = {
//     loader: 'babel-loader',
//     options: babelLoaders()
//   }

//   if (isDev) {
//     loaders.loader.push('eslint-loader')
//   }

//   return loaders
// }

module.exports = {
  // Контекст
  context: path.resolve(__dirname, 'src'),
  // Режим
  mode: 'development',
  // Точки входа
  entry: {
    main: ['@babel/polyfill', './app.js']
  },
  // Вывод
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  // Расширение + Алиас
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@models': path.resolve(__dirname, 'src/models'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  // Оптимизация
  optimization: optimization(),
  // Сервер для разработки
  devServer: {
    port: 4200,
    overlay: true,
    open: true,
    hot: isDev
  },
  // Для разработки
  devtool: isDev ? 'source-map' : false,
  // Плагины
  plugins: plugins(),
  // Модули
  module: {
    // Правила
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders()
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders('sass-loader')
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader']
      },
      {
        test: /\.xml$/,
        use: ['xml-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: babelLoaders(),
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: babelLoaders('@babel/plugin-transform-typescript')
      }
    ]
  }
}