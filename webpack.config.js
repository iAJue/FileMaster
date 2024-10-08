const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/index.js', // 入口文件
    output: {
        filename: 'bundle.js', // 输出文件名
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/' // 静态资源路径
    },
    module: {
        rules: [
            {
                test: /\.js$/, // 匹配 JavaScript 文件
                exclude: /node_modules/, // 排除 node_modules
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'] // ES6 转译
                    }
                }
            },
            {
                test: /\.css$/, // 匹配 CSS 文件
                use: [MiniCssExtractPlugin.loader, 'css-loader'] // 使用 MiniCssExtractPlugin 代替 style-loader
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'style.css', // 输出的 CSS 文件名
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'), // 指定静态文件目录
        },
        hot: true, // 开启热模块替换
        open: true, // 启动开发服务器时自动打开浏览器
        compress: true, // 启用 gzip 压缩
        port: 9000 // 设置可用端口
    },
    mode: 'development'
};