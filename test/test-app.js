/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var mockery = require('mockery');
var os = require('os');

describe('Dephy generator test', function () {
  // not testing the actual run of generators yet
  it('thegenerator can be required without throwing', function () {
    this.app = require('../app');
  });

  describe('run test', function () {

    var expectedContent = [
      ['bower.json', /"name": "tmp"/],
      ['package.json', /"name": "tmp"/]
    ];
    var expected = [
      // Projectfiles
      '.editorconfig',
      '.jshintrc',
      '.gitignore',
      '.gitattributes',
      'package.json',
      'bower.json',
      'Gruntfile.js',
      //Jade
      'app/index.jade',
      'app/jade/layout.jade',
      //SCSS
      'app/scss/app.scss',
      'app/scss/_settings.scss',
      'app/scss/_custom.scss',
      //JavaScript
      'app/js/app.js'
    ];

    var options = {
      'skip-install-message': true,
      'skip-install': true,
    }

    before(function (done) {
      mockery.enable({ warnOnUnregistered: false });
      mockery.registerMock('github', function () {
        return {
          user: {
            getFrom: function (data, cb) {
              cb(null, JSON.stringify({
                name: 'Afaque Usman',
                email: 'afaque.katil@gmail.com',
                html_url: 'https://github.com/afaqueusman'
              }))
           }
         }
        };
      });
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(os.tmpdir(), '/yeoman-test'))
        .withOptions({ 'skip-install': true})
        .withPrompts({
          githubUser: 'imp',
          projectName: 'imp',
          projectDesc: 'temp',

          pkgName: false
        })
        .on('end', done);
    });

    after(function () {
      mockery.disable()
    });

    it('creates files', function () {
      assert.file(expected);
    });

    it('fills package.json with correct information', function () {
      assert.fileContent('package.json', /"name": "generator-temp"/);
    });

  //  it('setup travis.CI config', function () {
  //    assert.fileContent(
  //      '.travis.yml',
  //      /if \[ "\$currentfolder" != 'generator-temp' \]; then cd .. \&\& eval "mv \$currentfolder generator-temp" && cd generator-temp; fi/
  //    );
  //  });
  });
});





//describe('dpt:app', function () {
//  before(function (done) {
//    helpers.run(path.join(__dirname, '../app'))
//      .inDir(path.join(os.tmpdir(), './temp-test'))
//      .withOptions({ 'skip-install': true })
//      .withPrompt({
//        someOption: true
//      })
//      .on('end', done);
//  });
//
//  it('creates files', function () {
//    assert.file([
//      'bower.json',
//      'package.json',
//      '.editorconfig',
//      '.jshintrc'
//    ]);
//  });
//});
