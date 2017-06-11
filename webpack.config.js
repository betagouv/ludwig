module.exports = {
	entry: './src/js/ludwidget.js',
	output: {
		filename: './dist/ludwig.js'
	},
	module:{
		loaders: [
			{
				test: /\.js?$/,
				loader: 'babel',
				query: {
					presets: [ 'es2015' ]
				}
			}
		]
	}
};
