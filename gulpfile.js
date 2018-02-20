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
const realFavicon = require('gulp-real-favicon');
const fs = require('fs');

// paths

const src = {
  html: 'src/pug/*.pug',
  css: 'src/css/styles.css',
  stls: 'src/css/**/*.css',
  favicon: 'src/images/favicon.png'
};

const dist = {
  all: 'build/**/*',
  html: 'build/',
  css: 'build/css/',
  favicon: 'build/icons'
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

const FAVICON_DATA_FILE = 'faviconData.json';

gulp.task('generate-favicon', (done) => {
	realFavicon.generateFavicon({
		masterPicture: src.favicon,
		dest: dist.favicon,
		iconsPath: './icons/',
		design: {
			ios: {
				pictureAspect: 'backgroundAndMargin',
				backgroundColor: '#ffffff',
				margin: '14%',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#ffc40d',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'backgroundAndMargin',
				margin: '17%',
				backgroundColor: '#ffffff',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'blackAndWhite',
				threshold: 50,
				themeColor: '#333333'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, () => {
		done();
	});
});

gulp.task('inject-favicon-markups', () =>
  gulp.src(['build/*.html'])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest(dist.html)));

gulp.task('check-for-favicon-update', (done) => {
	const currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
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
