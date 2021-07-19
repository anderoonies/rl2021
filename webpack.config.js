const path = require('path');

module.exports = {
    entry: {
        final: './src/entries/final.ts',
        debugArcCount: './src/entries/debugarccount.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        symlinks: true,
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'cheap-module-source-map',
    mode: 'development',
};
