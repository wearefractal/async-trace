var through = require('through');
var less = require('less');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var defaults = require('lodash.defaults');

module.exports = function (options) {

  function parseLess (file) {
    if (file.isNull()) return this.push(file); // pass along
    if (file.isStream()) return self.emit('error', new PluginError('gulp-less', 'Streaming not supported'));

    // set the default options
    var opts = defaults(options || {}, {
      filename: file.path,
      paths: [ path.dirname(file.path) ]
    });

    // let people use their own compressor
    delete opts.compress;

    this.pause();

    var str = file.contents.toString('utf8');
    less.render(str, opts, function (err, css) {
      if (err) {
        this.emit('error', new PluginError('gulp-less', err));
        return;
      }
      file.contents = new Buffer(css);
      file.path = gutil.replaceExtension(file.path, '.css');
      this.queue(file);
      this.resume();
    }.bind(this));
  }

  return through(parseLess);
};


