const gulp = require('gulp');
const ghp = require('gulp-gh-pages');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('gulp-cssnano');
const gcmq = require('gulp-group-css-media-queries');
const browserSync = require('browser-sync');

// paths

const src = {
  html: 'src/pug/*.pug',
  css: 'src/css/styles.css',
  stls: 'src/css/**/*.css'
};

const dist = {
  all: 'build/**/*',
  html: 'build/',
  css: 'build/css/'
};

// rules

gulp.task('html',
  () => gulp
    .src(src.html)
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest(dist.html))
);

gulp.task('css',
  () => gulp
    .src(src.css)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(postcss([
      require('postcss-import')({ root: './src/css *' }),
      autoprefixer({ browsers: ['last 3 version'] })
    ]))
    .pipe(gcmq())
    .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist.css))
);

// common

gulp.task('watch', () => {
  gulp.watch(src.html, { debounceDelay: 300 }, ['html']);
  gulp.watch(src.css, ['css']);
});

gulp.task('browser-sync', () => {
  const files = [
    dist.all
  ];

  browserSync.init(files, {
    server: { baseDir: './build/' }
  });
});

gulp.task('build', () => {
  gulp.start('html', 'css');
});

gulp.task('deploy',
  () => gulp
    .src(dist.all)
    .pipe(ghp())
);

gulp.task('default', [
  'build',
  'watch',
  'browser-sync'
]);
