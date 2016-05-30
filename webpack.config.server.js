module.exports = {
	entry: './guiUtils/guiUtilsWrapper.js',
	output: {
		filename: './dist/guiUtils.js'
	},
	module:{
		loaders: [
			{
				test: /\.js?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: [ 'es2015' ]
				}
			}
		]
	}
};
