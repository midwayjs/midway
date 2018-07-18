import {expect, should} from 'chai';
const path = require('path');

(<any>global).should = should;
(<any>global).expect = expect;
(<any>global)._ROOT = path.join(__dirname, '../');
