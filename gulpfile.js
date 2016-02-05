/*
 * Copyright 2016 FUJITSU LIMITED
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

var babel = require('babel-register')({
  presets: ['es2015']
});

var gulp = require('gulp');
var path = require('path');
var mkdirp = require('mkdirp');
var Rsync = require('rsync');
var Promise = require('bluebird');
var eslint = require('gulp-eslint');
var rimraf = require('rimraf');
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');
var fs = require('fs');
var mocha = require('gulp-mocha');

var pkg = require('./package.json');
var packageName = pkg.name + '-' + pkg.version;

// relative location of Kibana install
var pathToKibana = '../kibana';

var buildDir = path.resolve(__dirname, 'build');
var targetDir = path.resolve(__dirname, 'target');
var buildTarget = path.resolve(buildDir, pkg.name);
var kibanaPluginDir = path.resolve(__dirname, pathToKibana, 'installedPlugins', pkg.name);

var exclude = [
  '.git',
  '.idea',
  'gulpfile.js',
  '.babelrc',
  '.gitignore',
  '.eslintrc',
  '__tests__'
];

Object.keys(pkg.devDependencies).forEach(function (name) {
  exclude.push(path.join('node_modules', name));
});

function syncPluginTo(dest, done) {
  mkdirp(dest, function (err) {
    if (err) return done(err);

    var source = path.resolve(__dirname) + '/';
    var rsync = new Rsync();

    rsync
      .source(source)
      .destination(dest)
      .flags('uav')
      .recursive(true)
      .set('delete')
      .exclude(exclude)
      .output(function (data) {
        process.stdout.write(data.toString('utf8'));
      });

    rsync.execute(function (err) {
      if (err) {
        console.log(err);
        return done(err);
      }
      done();
    });
  });
}

gulp.task('sync', ['lint'], function (done) {
  syncPluginTo(kibanaPluginDir, done);
});

gulp.task('lint', function () {
  var filePaths = [
    'gulpfile.js',
    'server/**/*.js',
    'public/**/*.js',
    'public/**/*.jsx'
  ];

  return gulp.src(filePaths)
    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.formatEach())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
    .pipe(eslint.failOnError());
});

gulp.task('test', function () {
  return gulp.src(['server/**/*.spec.js'])
    .pipe(mocha({
      compilers: {
        js: babel
      }
    }));
});

gulp.task('clean', function (done) {
  Promise.each([buildDir, targetDir], function (dir) {
    return new Promise(function (resolve, reject) {
      rimraf(dir, function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }).nodeify(done);
});

gulp.task('build', ['clean'], function (done) {
  syncPluginTo(buildTarget, done);
});

gulp.task('package', ['build'], function () {
  return gulp.src(path.join(buildDir, '**', '*'))
    .pipe(tar(packageName + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest(targetDir));
});

gulp.task('dev', ['sync'], function () {
  gulp.watch(
    ['package.json', 'index.js', 'public/**/*', 'server/**/*'],
    ['sync']);
});
