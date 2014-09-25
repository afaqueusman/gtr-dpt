'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

/* jshint -W106 */
var proxy = process.env.http_proxy || process.env.HTTP_PROXY || process.env.https_proxy ||
  process.env.HTTPS_PROXY || null;
/* jshint +W106 */
var githubOptions = {
  version: '3.0.0'
};

if (proxy) {
  var proxyUrl = url.parse(proxy);
  githubOptions.proxy = {
    host: proxyUrl.hostname,
    port: proxyUrl.port
  };
}

var GitHubApi = require('github');
var github = new GitHubApi(githubOptions);

if (process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN
  });
}

var extractProjectName = function (_, appname) {
  var slugged = _.slugify(appname);
  var match = slugged.match(/^IA-(.+)/);

  if (match && match.length === 2) {
    return match[1].toLowerCase();
  }

  return slugged;
};

var githubUserInfo = function (name, cb) {
  github.user.getFrom({
    user: name
  }, function (err, res) {
    if (err) {
      throw new Error(err.message +
        '\n\nCannot fetch your github profile. Make sure you\'ve typed it correctly.');
    }
    cb(JSON.parse(JSON.stringify(res)));
  });
};

var IaGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    this.currentYear = (new Date()).getFullYear();
  },

  prompting:{
    askFor: function () {
      var done = this.async();

      this.log(yosay('Start a New Project'));

      var prompts = [{
        type: 'input',
        name: 'githubUser',
        message: 'Would you mind telling me your username on GitHub?',
        default: 'afaqueusman'
      }];

      this.prompt(prompts, function (props) {
        this.githubUser = props.githubUser;

        done();
      }.bind(this));
    },

    askForProjectName: function () {
      var done = this.async();
      var projectName = extractProjectName(this._, this.appname);

      var prompts = [{
        type: 'input',
        name: 'projectName',
        message: 'What\'s the base name of your project?',
        default: projectName
      }, {
      type: 'input',
      name: 'projectDesc',
      message: 'Your project description',
      default: 'The  coolest design ever'
      }];

      this.prompt(prompts, function (props) {
        if (props.pkgName) {
          return this.prompting.askForProjectName.call(this);
        }

        this.projectName = props.projectName;
        this.appname = 'IA-' + this.projectName;
        this.projectDesc = props.projectDesc;

        done();
      }.bind(this));
    },

    askForJadeCompass: function () {
      var done = this.async();

      var prompts = [{
        type: 'confirm',
        name: 'jade',
        message: 'Would you like to use Jade? (templating engine)',
        default: true
      }, {
        type: 'confirm',
        name: 'compass',
        message: 'Would you like to use Scss (with Compass)? (default: Libsass)',
        default: false 
      }, {
        type: 'confirm',
        name: 'fontAwesome',
        message: 'Would you like to include Font Awesome? (Font Awesome gives you scalable vector icons..)',
        default: false
      }];

      this.prompt(prompts, function (props) {
        this.jade = props.jade;
        this.compass = props.compass;
        this.fontAwesome = props.fontAwesome;

        done();
      }.bind(this));
    },
  },

  configuring: {
    enforceFolderName: function () {
      if (this.appname !== this._.last(this.destinationRoot().split(path.sep))) {
        this.destinationRoot(this.appname);
      }
      this.config.save();
    },

    userInfo: function () {
      var done = this.async();

      githubUserInfo(this.githubUser, function (res) {
        /*jshint camelcase:false */
        this.realname = res.name;
        this.email = res.email;
        this.githubUrl = res.html_url;
        done();
      }.bind(this));
    }
  }, // configuring

  writing: {
    projectfiles: function () {
      this.template('AUTHORS');
      this.template('CHANGELOG');
      this.template('LICENSE-MIT');
      this.template('_gruntfile.js', 'Gruntfile.js');
      this.template('_package.json', 'package.json');
      this.template('_bower.json', 'bower.json');
      this.copy('bowerrc', '.bowerrc');
      this.copy('jshintrc.json', '.jshintrc');
      this.copy('editorconfig', '.editorconfig');
      this.copy('README.md', 'README.md');
    },

    gitfiles: function () {
      this.copy('gitignore', '.gitignore');
      this.copy('gitattributes', '.gitattributes');
    },

    app: function () {
      this.mkdir('app');
      this.mkdir('dist');
      this.mkdir('VAULT');
      this.mkdir('app/js');
      this.mkdir('app/img');
      this.mkdir('app/css');
      this.mkdir('app/scss');
      this.copy('scss/app.scss', 'app/scss/app.scss');
      this.copy('scss/_settings.scss', 'app/scss/_settings.scss');
      this.copy('scss/_custom.scss', 'app/scss/_custom.scss');
      this.copy('js/app.js', 'app/js/app.js');
      this.copy('img/favicon.png', 'app/img/favicon.png')
      if (this.jade) {
        this.template('jade/layout.jade', 'app/jade/layout.jade');
        this.copy('index.jade', 'app/index.jade');
      } else {
        this.template('index.html', 'app/index.html')
      }
    }
  }, // writing

  install: function () {
    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  }
});

module.exports = IaGenerator;