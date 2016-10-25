var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var globals = require('rollup-plugin-node-globals');
var builtins = require('rollup-plugin-node-builtins');
var json = require('rollup-plugin-json');

// https://github.com/rollup/rollup/wiki/JavaScript-API

var rollupConfig = {
  useStrict: false,
  /**
   * entry: The bundle's starting point. This file will
   * be included, along with the minimum necessary code
   * from its dependencies
   */
  entry: 'src/app/main.dev.ts',

  /**
   * sourceMap: If true, a separate sourcemap file will
   * be created.
   */
  sourceMap: true,

  /**
   * format: The format of the generated bundle
   */
  format: 'iife',

  /**
   * dest: the output filename for the bundle in the buildDir
   */
  dest: 'main.js',

  /**
   * plugins: Array of plugin objects, or a single plugin object.
   * See https://github.com/rollup/rollup/wiki/Plugins for more info.
   */
  plugins: [
    builtins(),
    commonjs({
      include: [
        'node_modules/rxjs/**', // firebase depends on rxjs and needs this to avoid build errors
        'node_modules/firebase/**', // here is firebase
        'node_modules/lodash/**' // lodash will complain when we try to use default import
      ],
      namedExports: {
        'node_modules/firebase/firebase.js': ['initializeApp', 'auth', 'database']
      }
    }),
    nodeResolve({
      module: true,
      jsnext: true,
      main: true,
      browser: true,
      extensions: ['.js']
    }),
    globals(),
    json()
  ]
};

if (process.env.IONIC_ENV == 'prod') {
  // production mode
  rollupConfig.entry = '/app/main.prod.ts';
  rollupConfig.sourceMap = false;
}

module.exports = rollupConfig;
