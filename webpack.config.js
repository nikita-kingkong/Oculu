const path = require('path')
// const HTMLWebpackPlugin = require('html-webpack-plugin')
// const {CleanWebpackPlugin} = require('clean-webpack-plugin')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
// const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
    const config = {
        // splitChunks: {
        //     chunks: 'all'
        // }
    }

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config
}

// const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`
const filename = ext => `[name].${ext}`

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true,
                sourceMap: true,
            },
        },
        {
            loader: "css-loader", 
            options: {
                url: false,
                sourceMap: true,
            } 
        },
    ]

    const postCssLoader = {
        loader: "postcss-loader",
        options: {
            postcssOptions: {
                plugins: [
                    [ "postcss-preset-env"],
                ],
            },
        },
    }
    if (isProd) {
        // Put postCssLoader right before css-loader
        loaders.splice(2, 0, postCssLoader);
    }

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if (preset) {
        opts.presets.push(preset)
    }

    return opts
}

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }]

    if (isDev) {
        // loaders.push('eslint-loader')
    }

    return loaders
}

const plugins = () => {
    const base = [
        // new HTMLWebpackPlugin({
        //   template: './index.html',
        //   minify: {
        //     collapseWhitespace: isProd
        //   }
        // }),
        // new CleanWebpackPlugin(),
        
        // new CopyWebpackPlugin([
        //   {
        //     from: path.resolve(__dirname, 'src/favicon.ico'),
        //     to: path.resolve(__dirname, 'dist')
        //   }
        // ]),

        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/' + filename('css'),
        })
    ]

    if (isProd) {
        // base.push(new BundleAnalyzerPlugin({
        //     analyzerPort: 4000,
        // }))
    }

    return base
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './main.js'],
        // analytics: './analytics.ts'
    },
    output: {
        filename: 'js/' + filename('js'),
        // path: path.resolve(__dirname, '../wp-content/themes/base/')
        path: path.resolve(__dirname, './'),
    },
    resolve: {
        extensions: ['.js', '.json', '.vue'],
        alias: {
            '@vue-components': path.resolve(__dirname, 'src/js/vue-components'),
            '@': path.resolve(__dirname, 'src'),
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    optimization: optimization(),
    devServer: {
        port: 4200,
        hot: isDev
    },
    devtool: isDev ? 'inline-source-map' : '',
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders({
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true,
                        sassOptions: {
                            outputStyle: "compressed",
                        },
                    }
                })
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
                test: /\.csv$/,
                use: ['csv-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-typescript')
                }
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-react')
                }
            },
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'vue-loader'
                }
            }
        ]
    }
}
