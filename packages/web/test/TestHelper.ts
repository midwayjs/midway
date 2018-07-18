import {expect, should} from 'chai';
const path = require('path');

(<any>global).should = should;
(<any>global).expect = expect;
(<any>global)._ROOT = path.join(__dirname, '../');

// set plugin dir
process.env.PLUGIN_PATH = path.join(__dirname, '../../../');