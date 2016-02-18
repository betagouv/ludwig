var gulp = require('gulp');
var webpack = require('webpack-stream');

gulp.task('default', function () {
    return gulp.src('./js/ludwidget.js')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./'));
});