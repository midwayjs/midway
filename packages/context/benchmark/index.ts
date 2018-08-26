import {Container, RequestContainer} from '../src';
import {UserService} from './singleton-scope/userService';
import {UserController} from './singleton-scope/userController';

const Benchmark = require('benchmark');

const suite = new Benchmark.Suite;

const applicationContext = new Container();
applicationContext.bind(UserService);
applicationContext.bind(UserController);

// add tests
suite
  .add('RequestContext#get', async () => {
    const requestContext = new RequestContainer({}, applicationContext);
    await requestContext.getAsync(UserController);
  })
  .add('Container#get', async () => {
    await applicationContext.getAsync(UserController);
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({'async': true});
