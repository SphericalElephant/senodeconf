'use strict';

const nconf = require('nconf');
const path = require('path');

const ALLOWED_ENV = [
  'production',
  'staging',
  'development',
  'local',
  'test'
];

const createStageConfigFileNameFromTemplate = (template, env) => {
  if (!template || !env) return null;
  const regex = /%%STAGE%%/gi;
  if ((template.match(regex) || []).length !== 1) {
    throw new Error('you must use %%STAGE%% exactly once');
  }
  return template.replace(regex, env);
};

const getConfigPath = (type, name, env, opts) => {
  opts = opts || {};
  if ((opts.allowedEnv || ALLOWED_ENV).indexOf(env) === -1)
    throw new Error('Unsupported env type! ' + env);

  const stageConfig = createStageConfigFileNameFromTemplate(opts.configFileNameTemplate, env) || env + '.conf.json';
  switch (type) {
    case 'global':
      return path.join('/', 'etc', name, stageConfig);
    case 'user':
      return path.join(process.env.HOME, '.' + name, stageConfig);
    case 'local':
      return path.join('./', stageConfig);
    default:
      throw new Error('Unsupported type: ' + type);
  }
};

const obtainConfigObject = (globalPath, userPath, localPath) => {
  nconf
    .argv()
    .env()
    .file('local', localPath)
    .file('user', userPath)
    .file('global', globalPath);
  return nconf;
};

module.exports = (name, opts) => {
  opts = opts || {};
  const env = process.env.NODE_ENV || opts.defaultEnv || 'development';
  return obtainConfigObject(...['global', 'user', 'local'].map(type => getConfigPath(type, name, env, opts)));
};

