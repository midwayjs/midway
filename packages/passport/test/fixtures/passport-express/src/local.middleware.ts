import { Init, Inject, Provide } from '@midwayjs/decorator';
import { Middleware } from '../../../../../web-express';
import { MidwayPassportService } from '../../../../src';
import * as LocalStrategy from 'passport-local';

@Provide('local')
export class LocalPassportMiddleware {

  @Inject()
  passport: MidwayPassportService;

  @Init()
  init() {
    // this.passport.use(new LocalStrategy(
    //   function(username, password, done) {
    //     console.log(username, password);
    //     done({
    //       name: 'zhangting111'
    //     });
    //   }
    // ));
  }

  resolve(): Middleware {
    return (req, res, next) => {
      this.passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/users/' + user.username);
        });
      })(req, res, next);
    };
  }
}

@Provide('local2')
export class LocalPassportMiddleware2{

  @Inject()
  passport: MidwayPassportService;

  resolve(): Middleware {
    return async (req, res, next) => {
      this.passport.use(new LocalStrategy(
        function(username, password, done) {
          console.log(username, password);
          done({
            name: 'zhangting'
          });
        }
      ));
    };
  }
}

