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
// 需要通过 cross-env 定义环境变量
const isProduction = process.env.NODE_ENV === "production";
// element-plus
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const {
    ElementPlusResolver
} = require('unplugin-vue-components/resolvers')
// 配置主题

const getStyleLoader = (loader) => {
    return [
        isProduction ? MiniCssExtractPlugin.loader : "vue-style-loader",
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
        // loader === "sass-loader" ? {
        //     loader: loader,
        //     options: {
        //         scss: {
        //             additionalData: `@use "@/styles/element/index.scss" as *;`,
        //         },
        //     }
        // } : loader
    ].filter(Boolean)
}
module.exports = {
    entry: './src/main.js',
    output: {
        path: isProduction ? path.resolve(__dirname, "../dist") : undefined,
        filename: isProduction ? 'static/js/[name].[contenthash:10].js' : 'static/js/[name].js',
        chunkFilename: isProduction ? 'static/js/[name].[contenthash].chunk.js' : 'static/js/[name].chunk.js',
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
                    // 开启缓存
                    cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/vue-loader'),
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
        }),
        isProduction && new MiniCssExtractPlugin({
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
            patterns: [{
                from: path.resolve(__dirname, "../public"),
                to: path.resolve(__dirname, "../dist"),
                globOptions: {
                    ignore: ["**/index.html"]
                },
                info: {
                    minimized: true,
                },

            }]
        }),
        // 按需加载element-plus
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver({
                // 自定义主题
                // importStyle: "sass",
            })],
        }),
    ].filter(Boolean),
    optimization: {
        minimize: isProduction,
        minimizer: [
            new TerserPlugin(),
            new CssMinimizerPlugin(),
        ],
        splitChunks: {
            chunks: "all",
            // 分组打包
            chunkGroups: {
                cacheGroups: {
                    // layouts通常是admin项目的主体布局组件，所有路由组件都要使用的
                    // 可以单独打包，从而复用
                    // 如果项目中没有，请删除
                    layouts: {
                        name: "layouts",
                        test: path.resolve(__dirname, "../src/layouts"),
                        priority: 40,
                    },
                    // 如果项目中使用element-plus，此时将所有node_modules打包在一起，那么打包输出文件会比较大。
                    // 所以我们将node_modules中比较大的模块单独打包，从而并行加载速度更好
                    // 如果项目中没有，请删除
                    elementUI: {
                        name: "chunk-elementPlus",
                        test: /[\\/]node_modules[\\/]_?element-plus(.*)/,
                        priority: 30,
                    },
                    // 将vue相关的库单独打包，减少node_modules的chunk体积。
                    vue: {
                        name: "vue",
                        test: /[\\/]node_modules[\\/]vue(.*)[\\/]/,
                        chunks: "initial",
                        priority: 20,
                    },
                    libs: {
                        name: "chunk-libs",
                        test: /[\\/]node_modules[\\/]/,
                        priority: 10, // 权重最低，优先考虑前面内容
                        chunks: "initial",
                    },
                },
            }
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}`,
        },
    },
    resolve: {
        extensions: [".vue", ".js", ".json"],
        alias: {
            "@": path.resolve(__dirname, "../src"),
        }
    },
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    mode: isProduction ? 'production' : "development",
    devServer: {
        host: "localhost",
        port: 3001,
        open: true,
        hot: true,
        historyApiFallback: true, // 解决vue-router刷新404问题
    },
    performance: false
}