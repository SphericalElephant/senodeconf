# senodeconfig
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status](https://travis-ci.com/SphericalElephant/senodeconf.svg?branch=master)](https://travis-ci.com/SphericalElephant/senodeconf)
[![Coverage Status](https://coveralls.io/repos/github/SphericalElephant/senodeconf/badge.svg?branch=master)](https://coveralls.io/github/SphericalElephant/senodeconf?branch=master)

## About

A simple nconf wrapper that supports multiple stages (environments via NODE_ENV) and provides sane configuration file lookups on *nix systems.

## Installation

```$ npm install @sphericalelephant/senodeconf```

## Getting Started

### Basic Usage

*lib/config.js*

*NODE_ENV=development*
```javascript
// lib/myconfig.js
module.exports = require('senodeconfig')('my-app');

// other file
const config = require('lib/myconfig');
config.get('my:setting'); // can be used like nconf
```

merges the following configurations in the following order:

* ./development.conf.json
* ~/.my-app/development.conf.json
* /etc/my-app/development.conf.json

The settings within the global config in /etc/ are overridden by the user specific configuration in ~, which are in turn overridden by any settings made in the local config file placed in the current working directory.

### Supported Options

*lib/config.js*
```javascript
module.exports = require('senodeconfig')('my-app', {
  // array of allowed environments (NODE_ENv), defaults to  ['production', 'staging', 'development', 'local', 'test'];
  allowedEnv: [],
  // sets the default environment that is used when NODE_ENV has not been specified, defaults to 'development'
  // careful: defaultEnv must be an allowedEnv
  defaultEnv: 'environment',
  // allows adjusting the config file name, %%STAGE%% must be used exacly once, as it is substituted
  configFileNameTemplate: '%%STAGE%%_custom_config_name.json'
});
```

## License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/@sphericalelephant/senodeconf.svg
[npm-url]: https://npmjs.org/package/@sphericalelephant/senodeconf
[downloads-image]: https://img.shields.io/npm/dm/@sphericalelephant/senodeconf.svg
[downloads-url]: https://npmjs.org/package/@sphericalelephant/senodeconf
