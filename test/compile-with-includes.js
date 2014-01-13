var less = require('../');
var should = require('should');
var lessc = require('less');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through');

var expected = fs.readFileSync(path.join(__dirname, 'fixtures', 'test.css'), 'utf8');
var filePath = path.join(__dirname, 'fixtures', 'test-with-include.less');
var base = path.join(__dirname, 'fixtures');
var cwd = __dirname;
var file = new gutil.File({
  cwd: cwd,
  base: base,
  path: filePath,
  contents: fs.readFileSync(filePath)
});

describe('gulp-less', function () {
  describe('less()', function () {
    it('should compile a less file', function (done) {
      var stream = less({
        paths: [ path.join(__dirname, 'fixtures', 'includes') ]
      });
      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);

        newFile.path.should.equal(path.join(__dirname, 'fixtures', 'test-with-include.css'));
        newFile.relative.should.equal('test-with-include.css');
        String(newFile.contents).should.equal(expected);
        done();
      });
      stream.write(file);
    });

    it('should compile a less file when upstream ends', function (done) {
      var stream = less({
        paths: [ path.join(__dirname, 'fixtures', 'includes') ]
      });
      var stream2 = through();
      var count = 0;
      var expectedCount = 100;
      stream2.pipe(stream);
      stream.on('error', done);
      stream.on('data', function(newFile) {
        count++;
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);

        newFile.path.should.equal(path.join(__dirname, 'fixtures', 'test-with-include.css'));
        newFile.relative.should.equal('test-with-include.css');
        String(newFile.contents).should.equal(expected);
      });
      stream.on('end', function(){
        count.should.equal(expectedCount);
        done();
      });

      for (var i = 0; i < expectedCount; i++) {
        stream2.write(file);
      }
      stream2.end();
    });

  });
});
