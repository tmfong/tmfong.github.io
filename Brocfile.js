var filterCoffeeScript = require('broccoli-coffee');
var filterTemplates = require('broccoli-template');
var uglifyJavaScript = require('broccoli-uglify-js');
var compileES6 = require('broccoli-es6-concatenator');
var compileSass = require('broccoli-sass');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var findBowerTrees = require('broccoli-bower');
var env = require('broccoli-env').getEnv();

function preprocess (tree) {
  tree = filterTemplates(tree, {
    extensions: ['hbs', 'handlebars'],
    compileFunction: 'Ember.Handlebars.compile'
  })
  tree = filterCoffeeScript(tree, {
    bare: true
  })
  return tree
}

var app = 'app';
app = pickFiles(app, {
  srcDir: '/',
  destDir: 'appkit' // move under appkit namespace
});
app = preprocess(app);

var styles = 'styles';
styles = pickFiles(styles, {
  srcDir: '/',
  destDir: 'appkit'
});
styles = preprocess(styles);

var tests = 'tests';
tests = pickFiles(tests, {
  srcDir: '/',
  destDir: 'appkit/tests'
});
tests = preprocess(tests);

var vendor = 'vendor'; // TMF: to include vendor js
vendor = pickFiles(vendor, {
  srcDir: '/',
  destDir: 'vendor'
});
vendor = preprocess(vendor);

var loader = 'loader';  // TMF: move out of loader

var sourceTrees = [app, styles, vendor, loader];
if (env !== 'production') {
  sourceTrees.push(tests);
}
sourceTrees = sourceTrees.concat(findBowerTrees());

var appAndDependencies = new mergeTrees(sourceTrees, { overwrite: true });

var appJs = compileES6(appAndDependencies, {
  loaderFile: 'loader.js',
  ignoredModules: [
    'ember/resolver'
  ],
  inputFiles: [
    'appkit/**/*.js'
  ],
  legacyFilesToAppend: [
    'jquery.js',
    'handlebars.js',
    'ember.js',
    'ember-data.js',
    'ember-resolver.js',
    'vendor/d3.min.js', // include in app.js
    'vendor/showdown.js',
    'vendor/moment.min.js',
    'vendor/dropbox-datastores-1.0.1.js'
  ],
  wrapInEval: false, //env !== 'production',
  outputFile: '/assets/app.js'
});

var appCss = compileSass(sourceTrees, 'appkit/app.scss', 'assets/app.css');

// if (env === 'production') {
  appJs = uglifyJavaScript(appJs, {
    mangle: false,
    compress: true
  });
// }

var publicFiles = 'public';

module.exports = mergeTrees([appJs, appCss, publicFiles]); 
