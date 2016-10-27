var env = process.env.NODE_ENV || 'development';
var path = require('path');
var pkg = require('./package.json');
var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var banner = [
    pkg.name + ' by ' + pkg.author,
    pkg.homepage,
    'Version: ' + pkg.version + ' - ' +  new Date().getTime(),
    'License: ' + pkg.license
].join('\n');

var config = {
    entry: __dirname + '/src/index.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/lib',
        filename: pkg.name + (env === 'production' ? '.min' : '') + '.js',
        library: pkg.name,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'eslint',
                exclude: /node_modules/
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        root: path.resolve('./src'),
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.BannerPlugin(banner)
    ]
};

if (env === 'production') {
    config.plugins.push(new UglifyJsPlugin({
        mangle: true,
        compress: {
            drop_console: true,
            drop_debugger: true,
            warnings: false
        }
    }));
    outputFile = pkg.name + '.min.js';
} else {
    config.watch = true;
}

module.exports = config;