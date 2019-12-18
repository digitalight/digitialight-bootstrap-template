const gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	sass = require('gulp-sass'),
	sourcemap = require('gulp-sourcemaps'),
	babel = require('gulp-babel'),
	concat = require('gulp-concat'),
	minify = require('gulp-minify'),
	cleanCSS = require('gulp-clean-css'),
	rename = require('gulp-rename');
(prefix = require('gulp-autoprefixer')), (del = require('del'));

// path to build folder
const buildFolder = './dist';
// path to development folder
const devFolder = './src';

// copy bootstrap js files to src/js folder
function copy_bootstrap_dependencies() {
	return gulp
		.src([
			'node_modules/bootstrap/dist/js/bootstrap.js',
			'node_modules/jquery/dist/jquery.js',
			'node_modules/popper.js/dist/umd/popper.js'
		])
		.pipe(gulp.dest(`${devFolder}/js`));
}

// GULP DEVELOPMENT
function scss() {
	return gulp
		.src(`${devFolder}/scss/**/*.scss`)
		.pipe(sass().on('error', sass.logError)) // compile scss and log error when there is one
		.pipe(
			prefix({
				browsers: ['last 2 versions'],
				cascade: false
			})
		) // auto vendor prefix all css
		.pipe(gulp.dest(`${devFolder}/css`)) // put compiled scss into css folder
		.pipe(browserSync.stream()); // sync stream on all browsers
}

function watchFiles() {
	browserSync.init({
		server: {
			baseDir: devFolder
		}
	}); // init browser sync

	gulp.watch(`${devFolder}/scss/**/*.scss`, scss); // watch scss folder for changes and run the scss function
	gulp.watch(`${devFolder}/**/*.html`).on('change', browserSync.reload); // watch html files for changes
	gulp.watch(`${devFolder}/js/*.js`).on('change', browserSync.reload); // watch js folder for changes and run the js function
}

// GULP PRODUCTION
function clean_production() {
	return del(`${buildFolder}`); // clean the dist folder from old code
}

function scss_production() {
	return gulp
		.src(`${devFolder}/scss/**/*.scss`)
		.pipe(sass()) // compile scss into css
		.pipe(
			prefix({
				browsers: ['last 2 versions'],
				cascade: false
			})
		) // auto vendor prefix all css
		.pipe(gulp.dest(`${buildFolder}/css`)); // put compiled and prefixed css into build folder
}

function scss_min_production() {
	return gulp
		.src(`${devFolder}/scss/**/*.scss`)
		.pipe(sass()) // compile scss into css
		.pipe(
			prefix({
				browsers: ['last 2 versions'],
				cascade: false
			})
		) // auto vendor prefix all css
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(rename(`styles.min.css`))
		.pipe(gulp.dest(`${buildFolder}/css`)); // put compiled and prefixed css into build folder
}

function js_production() {
	return gulp
		.src(`${devFolder}/js/**/*.js`)
		.pipe(
			babel({
				presets: ['@babel/env']
			})
		)
		.pipe(
			minify({
				ext: {
					src: '.js',
					min: '.min.js'
				}
			})
		)
		.pipe(gulp.dest(`${buildFolder}/js`)); // put js into build folder
}

function html_production() {
	return gulp.src(`${devFolder}/**/*.html`).pipe(gulp.dest(`${buildFolder}`)); // put all html files into build folder
}

const build = gulp.series(
	clean_production,
	scss_production,
	scss_min_production,
	js_production,
	html_production
); // tasks to run for build process
const watch = watchFiles; // tasks to run for development process
const bootstrap = copy_bootstrap_dependencies; // task to run for development process

exports.bootstrap = bootstrap; // copy needed bootstrap js files for project to js folder
exports.build = build; // exports the build task
exports.watch = watch; // exports the development task