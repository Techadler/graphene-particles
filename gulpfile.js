var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');

var tsproject = ts.createProject('tsconfig.json');

gulp.task('build', function () {
    var tsresult = tsproject.src()
        .pipe(sourcemaps.init())
        .pipe(tsproject());
    return tsresult.js
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('build'));
});

gulp.task('default', ['build'], function () {

});

gulp.task('watch', ['default'], function () {
    gulp.watch('src/**/*.ts', ['build']);
})