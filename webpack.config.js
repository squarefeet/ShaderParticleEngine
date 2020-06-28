const path = require( 'path' );
const webpack = require( 'webpack' );
const packageJSON = require( './package.json' );
const licenseBanner =
    '/* ' + packageJSON.name + ' ' + packageJSON.version + '\n' +
    ' * ' + '\n' +
    ' * (c) 2015 Luke Moody (http://www.github.com/squarefeet)' + '\n' +
    ' *     Originally based on Lee Stemkoski\'s original work (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).' + '\n' +
    ' *' + '\n' +
    ' * ' + packageJSON.name + ' may be freely distributed under the MIT license (See LICENSE at root of this repository.)' + '\n */\n';

module.exports = {
	entry: './src/index.js',

	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'SPE.js',
		library: 'SPE',
		libraryTarget: 'var',
	},

	resolve: {
		alias: {
			'@': path.resolve( __dirname, 'src' ),
		},
	},

	externals: {
		three: 'THREE',
	},

	plugins: [
		new webpack.BannerPlugin( licenseBanner ),
	],

	devtool: process.env.NODE_ENV === 'production' ? '' : 'inline-source-map',
};