import { SessionOptions } from 'express-session';

export const session: SessionOptions = {
  secret: undefined, // must be set in application
  name: 'MW_SESS',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 3600 * 1000, // ms
    httpOnly: true,
    // sameSite: null,
  },
};
