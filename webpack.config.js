const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    module: {
        rules: [{test: /\.ts$/, loader: 'ts-loader'}]
    },
    entry: {
        content: path.resolve('src', 'ts', 'content.ts'),
        background: path.resolve('src', 'ts', 'background.ts'),
    },
    output: {
        path: path.resolve('dist'),
        filename: '[name].bundle.js',
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                from: path.join('src', 'manifest.json'),
                to: 'manifest.json'
            }]
        })
    ],
    mode: 'development',
    // We can't use any eval-based devtool, as CSP bans the use of eval().
    devtool: false
};
