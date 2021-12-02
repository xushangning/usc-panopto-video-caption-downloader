const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        content: path.resolve('.', 'src', 'js', 'content.js'),
        background: path.resolve('.', 'src', 'js', 'background.js'),
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
