'use strict';
/* eslint-env node, mocha */
/* eslint no-unused-expressions: "off" */

const expect = require('chai').expect;
const rewire = require('rewire');
const sinon = require('sinon');
const path = require('path');

const senodeconf = require('../index');
const _senodeconf = rewire('../index.js');

const getConfigPath = _senodeconf.__get__('getConfigPath');
const obtainConfigObject = _senodeconf.__get__('obtainConfigObject');
const createStageConfigFileNameFromTemplate = _senodeconf.__get__('createStageConfigFileNameFromTemplate');

describe('senodeconf', () => {
  before(done => {
    expect(getConfigPath).not.to.be.null;
    expect(obtainConfigObject).not.to.be.null;
    done();
  });

  it('should get the correct file name according to stage and name', done => {
    expect(getConfigPath('global', 'myprogram', 'production')).to.equal('/etc/myprogram/production.conf.json');
    expect(getConfigPath('global', 'myprogram', 'staging')).to.equal('/etc/myprogram/staging.conf.json');
    expect(getConfigPath('global', 'myprogram', 'development')).to.equal('/etc/myprogram/development.conf.json');
    expect(getConfigPath('global', 'myprogram', 'test')).to.equal('/etc/myprogram/test.conf.json');
    expect(getConfigPath('global', 'myprogram', 'local')).to.equal('/etc/myprogram/local.conf.json');
    done();
  });

  it('should get the correct file name according to config type and name', done => {
    expect(getConfigPath('global', 'myprogram', 'production')).to.equal('/etc/myprogram/production.conf.json');
    expect(getConfigPath('user', 'myprogram', 'production')).to.equal(path.join(process.env.HOME, '.myprogram', '/production.conf.json'));
    expect(getConfigPath('local', 'myprogram', 'production')).to.equal('production.conf.json');
    done();
  });

  it('should not accept invalid config types', done => {
    expect(getConfigPath.bind(null, 'invalidtype', 'myprogram', 'production')).to.throw('Unsupported type: invalidtype');
    done();
  });

  it('should not accept invalid stage types', done => {
    expect(getConfigPath.bind(null, 'global', 'myprogram', 'invalidstage')).to.throw('Unsupported env type! invalidstage');
    done();
  });

  it('should overwrite according to this order: global, user, local, env, arg', done => {
    const config = obtainConfigObject('./test/global.json', './test/user.json', './test/local.json');
    expect(config.get('fromGlobal')).to.equal(1);
    expect(config.get('fromUser')).to.equal(2);
    expect(config.get('fromLocal')).to.equal(3);
    done();
  });

  it('should create a config on call', done => {
    expect(senodeconf('test')).not.to.be.null;
    done();
  });

  it('should allow specifying custom environments', done => {
    expect(senodeconf.bind(null, 'test', {allowedEnv: ['foo', 'development']})).not.to.throw();
    done();
  });

  it('should allow setting a default environment that is used if NODE_ENV is not specified', done => {
    expect(senodeconf.bind(null, 'test', {allowedEnv: ['foo'], defaultEnv: 'foo'})).not.to.throw();
    done();
  });

  it('should throw an error if an illegal template string is provided', done => {
    expect(createStageConfigFileNameFromTemplate.bind(null, 'foo.json', 'test')).to.throw();
    expect(createStageConfigFileNameFromTemplate.bind(null, '%%STAGE%%%%STAGE%%.json', 'test')).to.throw();
    expect(createStageConfigFileNameFromTemplate.bind(null, '%%STAGE%%_%%STAGE%%.json', 'test')).to.throw();
    done();
  });

  it('should create a proper config file name according to the template specification', done => {
    expect(createStageConfigFileNameFromTemplate('%%STAGE%%.json', 'development')).to.equal('development.json');
    done();
  });

  it('should use the template string to get the config path', done => {
    expect(getConfigPath('global', 'myprogram', 'production', {
      configFileNameTemplate: '%%STAGE%%_WAT.json'
    })).to.equal('/etc/myprogram/production_WAT.json');
    done();
  });

  it('should use the default env separator if no other has been specified', done => {
    const opts = {

    }
    const oldNconf = _senodeconf.__get__('nconf');
    const nconfSpy = {
      argv: sinon.stub().returnsThis(),
      env: sinon.stub().returnsThis(),
      file: sinon.stub().returnsThis()
    }

    _senodeconf.__set__('nconf', nconfSpy);
    obtainConfigObject(...['global', 'user', 'local'].map(type => getConfigPath('local', 'name', 'development', opts)), opts);
    expect(nconfSpy.env.calledWith({separator: '_'})).to.be.true
    _senodeconf.__set__('nconf', oldNconf);

    done();
  });

  it('should use the specified env separator', done => {
    const opts = {
      envSeparator: '___'
    }
    const oldNconf = _senodeconf.__get__('nconf');
    const nconfSpy = {
      argv: sinon.stub().returnsThis(),
      env: sinon.stub().returnsThis(),
      file: sinon.stub().returnsThis()
    }

    _senodeconf.__set__('nconf', nconfSpy);
    obtainConfigObject(...['global', 'user', 'local'].map(type => getConfigPath('local', 'name', 'development', opts)), opts);
    expect(nconfSpy.env.calledWith({separator: '___'})).to.be.true
    _senodeconf.__set__('nconf', oldNconf);

    done();
  });
});
