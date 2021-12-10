import * as path from 'path';
import * as CopyPlugin from 'copy-webpack-plugin';
import * as webpack from 'webpack';

const config: webpack.Configuration = {
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
        // The Compiler type in CopyPlugin.apply(compiler: Compiler) is
        // incompatible with that in webpack.WebpackPluginInstance because it's
        // imported from an older version of webpack type definitions.
        }) as any as webpack.WebpackPluginInstance
    ],
    mode: 'development',
    // We can't use any eval-based devtool, as CSP bans the use of eval().
    devtool: false
};

export default config;
