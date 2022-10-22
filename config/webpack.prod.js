const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const {
    DefinePlugin
} = require("webpack");
const {
    VueLoaderPlugin
} = require("vue-loader")
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const getStyleLoader = (loader) => {
    return [
        MiniCssExtractPlugin.loader,
        "css-loader",
        // 配置css样式兼容，从下往上加载
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: ["postcss-preset-env"]
                },
            }
        },
        loader
    ].filter(Boolean)
}
module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: 'static/js/[name].[contenthash:10].js',
        chunkFilename: 'static/js/[name].[contenthash].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
        clean: true,
    },
    module: {
        rules: [{
                test: /\.css$/,
                use: getStyleLoader(),
            },
            {
                test: /\.less$/,
                use: getStyleLoader("less-loader"),
            },
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoader("sass-loader"),
            },
            {
                test: /\.(jpe?g|gif|svg|png)/,
                type: 'asset',
                parser: {
                    // 配置图片小于10kb就转化成base64格式：可以减少请求次数
                    dataUrlCondition: {
                        maxSize: 10 * 1024,
                    }
                }
            },
            {
                test: /\.(woff2?|ttf)/,
                type: 'asset-resource',
            },
            {
                test: /\.js/,
                include: path.resolve(__dirname, '../src'),
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                    }
                }]
            },
            {
                test: /\.vue$/,
                include: path.resolve(__dirname, "../src"),
                loader: 'vue-loader',
                options: {
                    cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/vue-loader'),
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
        }),
        new MiniCssExtractPlugin({
            filename: "static/css/[name].[contenthash:10].css",
            chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
          }),
        new EslintWebpackPlugin({
            cache: true,
            context: path.resolve(__dirname, '../src'),
            exclude: 'node_modules',
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"),
        }),
        
        new DefinePlugin({
            __VUE_OPTIONS_API__: "true",
            __VUE_PROD_DEVTOOLS__: "false",
        }),
        new VueLoaderPlugin(),
        new CopyPlugin({
            patterns: [
                { 
                    from : path.resolve(__dirname,"../public"),
                    to: path.resolve(__dirname,"../dist"),
                    globOptions: {
                        ignore: ["**/index.html"]
                    },
                }
            ]
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin(),
            new CssMinimizerPlugin(),
        ],
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}`,
        },
    },
    resolve: {
        extensions: [".vue",".js",".json"]
    },
    devtool: "source-map",
    mode: 'production',
    devServer: {
        host: "localhost",
        port: 3001,
        open: true,
        hot: true,
        historyApiFallback: true
    }
}