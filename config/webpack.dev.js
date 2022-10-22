const path = require('path');
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader");
const { DefinePlugin } = require('webpack');

const getStyleLoader = (loader)=>{
    return [
        "vue-style-loader",
        "css-loader",
        {
            loader: 'postcss-loader',
            options : {
                postcssOptions:{
                    plugins: ["postcss-preset-env"],
                }
            }
        },
        loader
    ].filter(Boolean)
}
// 五大核心模块
module.exports = {
    entry: './src/main.js',
    output: {
        path: undefined,
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
    },
    module: {
        rules: [
            // 处理css
            {
                test: /\.css$/,
                use: getStyleLoader()
            },
            {
                test: /\.less$/,
                use: getStyleLoader("less-loader")
            },
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoader("sass-loader")
            },
            // 处理图片
            {
                test: /\.(png|jpe?g|gif|svg|webp)/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
                    }
                }
            },
            // 其他资源
            {
                test: /\.(woff2?|ttf)/,
                type: "asset/resource",
            },
            // 处理js（语法检查）
            {
                test: /\.js$/,
                include: path.resolve(__dirname,'../src'),
                use:[
                    {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                            cacheCompression: false,
                        }
                    }
                ]
            },
            // 处理vue
            {
                test: /\.vue$/,
                loader : "vue-loader",
            }
        ]
    },
    plugins: [
        new EslintWebpackPlugin({
            context: path.resolve(__dirname,"../src"),
            exclude: 'node_modules',
            cache: true,
            cacheLocation: path.resolve(__dirname,'../node_modules/.cache/.eslintcache'),
            // thread: true, 看情况开启多核检查
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'../public/index.html'),

        }),
        new VueLoaderPlugin(),
        // cross-env 定义的环境变量给打包工具使用
        // DefinePlugin 定义环境变量给源代码使用，从而解决vue3页面警告问题
        new DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false
        })
    ],
    mode: 'development',
    devtool: 'cheap-module-source-map',
    optimization: {
        splitChunks:{
            chunks: "all",
        },
        runtimeChunk: {
            name:(entrypoint)=> `runtime~${entrypoint}.js`,
        }
    },
    // webpack解析模块加载选项
    resolve:{
        // 自动补全的文件扩展名
        extensions: [".vue",".js",".json"],
        alias: {
            "@": path.resolve(__dirname,"../src")
        }
    },
    devServer: {
        host: "localhost",
        port: 3001,
        open: true,
        hot: true,
        historyApiFallback: true
    }
}