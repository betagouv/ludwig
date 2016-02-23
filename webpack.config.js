module.exports = {
    entry: './js/ludwidget.js',
    output: {
        filename: './dist/bundle.js'
    },
	module:{
		loaders: [
			{
				test: /\.js?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			}
	  	]
	}
};
