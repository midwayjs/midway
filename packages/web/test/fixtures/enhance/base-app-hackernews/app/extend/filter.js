'use strict';

const moment = require('moment');

exports.relativeTime = time => moment(new Date(time * 1000)).fromNow();

exports.domain = url => url && url.split('/')[2];
