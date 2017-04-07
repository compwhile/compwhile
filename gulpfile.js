/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const injectModules = require('gulp-inject-modules');
const babel = require('gulp-babel');
const filter = require('gulp-filter');
const istanbul = require('gulp-babel-istanbul');
const clean = require('gulp-clean');
const sourceMaps = require('gulp-sourcemaps');

const files = [
  './src/**/*.js',
];
const filesNoSpec = [
  './src/**/*.js',
  '!./src/**/*.spec.js',
];
const specFiles = [
  './src/**/*.spec.js',
];

const configFiles = ['./src/**/*.json'];
const dist = 'dist';

gulp.task('clean', () => (
  gulp
    .src(dist, { read: false })
    .pipe(clean({ force: true }))));

gulp.task('pre:build', ['clean'], () => (
    gulp.src(filesNoSpec)
        .pipe(babel({ comments: false }))
        .pipe(injectModules())
        .pipe(gulp.dest(dist))));

gulp.task('pre:build-debug', ['clean'], () => (
  gulp.src(filesNoSpec)
    .pipe(sourceMaps.init())
    .pipe(babel({ comments: true }))
    .pipe(sourceMaps.write('.'))
    .pipe(injectModules())
    .pipe(gulp.dest(dist))));

gulp.task('copy-config', ['clean'], () => (
    gulp.src(configFiles)
        .pipe(gulp.dest(dist))));

gulp.task('build', ['clean', 'pre:build', 'copy-config']);

gulp.task('build-debug', ['clean', 'pre:build-debug', 'copy-config']);

gulp.task('test', () => (
    gulp.src(files)
        .pipe(babel())
        .pipe(injectModules())
        .pipe(filter('src/**/*.spec.js'))
        .pipe(mocha({
          reporter: 'mochawesome',
          reporterOptions: {
            reportDir: 'test-reports',
            reportFilename: 'test',
            reportTitle: 'compwhile-test',
            reportPageTitle: 'compwhile-test',
            autoOpen: true,
          },
          compilers: 'js:babel-core/register',
        }))));

gulp.task('dev-test', () => (
    gulp.src(files)
        .pipe(babel())
        .pipe(injectModules())
        .pipe(filter('src/**/*.spec.js'))
        .pipe(mocha({
          reporter: 'spec',
          compilers: 'js:babel-core/register',
        }))));

gulp.task('pre-cover', () => (
    gulp.src(filesNoSpec)
        .pipe(istanbul({ includeUntested: false }))
        .pipe(istanbul.hookRequire())));

gulp.task('cover', ['pre-cover'], () => (
    gulp.src(specFiles)
        .pipe(babel())
        .pipe(injectModules())
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 50 } }))));

gulp.task('watch', () => gulp.watch(files, ['dev-test']));

/* eslint-enable import/no-extraneous-dependencies */
