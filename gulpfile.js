var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var saveLicense = require('uglify-save-license');
var fs = require('fs');
var Server = require('karma').Server;

var path = {
  distribution: {
    folder: 'dist',
    filename: 'jquery-addthis'
  },
  copyright: 'src/copyright.js',
  source: 'src/**/*.js'
};

gulp.task('make-folders', function () {
  var folders = [path.distribution.folder];
  folders.forEach(function(folder) {
    try {
        fs.mkdirSync(folder);
    }
    catch(err) {
        if (err.code !== 'EEXIST') {
            console.warn(err);
        }
    }
  });
});

gulp.task('clean-distribution', function() {
  var files = path.distribution.folder + '/*';
  return gulp.src(files, {read: false}).pipe(clean());
});

gulp.task('concat', ['make-folders'], function() {
  var files = [].concat(
    [path.copyright],
    path.source
  );

  return gulp.src(files)
    .pipe(concat(path.distribution.filename + '.js'))
    .pipe(gulp.dest(path.distribution.folder));
});

gulp.task('minify', ['make-folders'], function() {
  var files = [].concat(
    [path.copyright],
    path.source
  );

  return gulp.src(files)
    .pipe(concat(path.distribution.filename + '.min.js'))
    .pipe(uglify({
      mangle: false,
      output: {
        comments: saveLicense
      }
    }))
    .pipe(gulp.dest(path.distribution.folder));
});

gulp.task('build', ['jslint', 'clean-distribution'], function(){
  return gulp.start(
    'minify',
    'concat'
  );
});

gulp.task('jslint', function() {
  return gulp.src([path.source, 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});


gulp.task('unit-test', function(done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('watch', ['build'], function() {
  gulp.watch(path.source);
});