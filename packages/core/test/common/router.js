exports.routerList1 = [
  {
    'prefix': '/swagger-ui',
    'routerName': '',
    'url': '/*',
    'requestMethod': 'get',
    'method': 'renderSwagger',
    'description': '',
    'summary': '',
    'handlerName': 'swagger:swaggerController.renderSwagger',
    'funcHandlerName': 'swagger:swaggerController.renderSwagger',
    'controllerId': 'swagger:swaggerController',
    'middleware': [],
    'controllerMiddleware': [],
    'requestMetadata': [],
    'responseMetadata': [],
  },
  {
    'prefix': '/swagger-ui',
    'routerName': '',
    'url': '/abc/*',
    'requestMethod': 'get',
    'method': 'renderSwagger',
    'description': '',
    'summary': '',
    'handlerName': 'swagger:swaggerController.renderSwagger',
    'funcHandlerName': 'swagger:swaggerController.renderSwagger',
    'controllerId': 'swagger:swaggerController',
    'middleware': [],
    'controllerMiddleware': [],
    'requestMetadata': [],
    'responseMetadata': [],
  },
  {
    'prefix': '/swagger-ui',
    'routerName': '',
    'url': '/:fileName',
    'requestMethod': 'get',
    'method': 'renderSwagger',
    'description': '',
    'summary': '',
    'handlerName': 'swagger:swaggerController.renderSwagger',
    'funcHandlerName': 'swagger:swaggerController.renderSwagger',
    'controllerId': 'swagger:swaggerController',
    'middleware': [],
    'controllerMiddleware': [],
    'requestMetadata': [],
    'responseMetadata': [],
  },
  {
    'prefix': '/swagger-ui',
    'routerName': '',
    'url': '/:abc/123',
    'requestMethod': 'get',
    'method': 'renderSwagger',
    'description': '',
    'summary': '',
    'handlerName': 'swagger:swaggerController.renderSwagger',
    'funcHandlerName': 'swagger:swaggerController.renderSwagger',
    'controllerId': 'swagger:swaggerController',
    'middleware': [],
    'controllerMiddleware': [],
    'requestMetadata': [],
    'responseMetadata': [],
  },
  {
    'prefix': '/swagger-ui',
    'routerName': '',
    'url': '/json',
    'requestMethod': 'get',
    'method': 'renderJSON',
    'description': '',
    'summary': '',
    'handlerName': 'swagger:swaggerController.renderJSON',
    'funcHandlerName': 'swagger:swaggerController.renderJSON',
    'controllerId': 'swagger:swaggerController',
    'middleware': [],
    'controllerMiddleware': [],
    'requestMetadata': [],
    'responseMetadata': [],
  },
  {
    'prefix': '/swagger-ui',
    'routerName': '',
    'url': '/',
    'requestMethod': 'get',
    'method': 'renderSwagger',
    'description': '',
    'summary': '',
    'handlerName': 'swagger:swaggerController.renderSwagger',
    'funcHandlerName': 'swagger:swaggerController.renderSwagger',
    'controllerId': 'swagger:swaggerController',
    'middleware': [],
    'controllerMiddleware': [],
    'requestMetadata': [],
    'responseMetadata': [],
  }];

exports.routerList2 = [
  {
    'prefix': '/',
    'routerName': '',
    'url': '/update',
    'requestMethod': 'patch',
    'method': 'update',
    'description': '',
    'summary': '',
    'handlerName': 'homeController.update',
    'funcHandlerName': 'homeController.update',
    'controllerId': 'homeController',
    'middleware': [],
    'controllerMiddleware': [],
    'requestMetadata': [
      {
        'index': 1,
        'type': 1,
        'propertyData': 'common:all_value_key'
      }
    ],
    'responseMetadata': [],
    '_pureRouter': '/update',
    '_level': 1
  },
  {
    'prefix': '/',
    'routerName': '',
    'url': '/',
    'requestMethod': 'post',
    'method': 'home',
    'description': '',
    'summary': '',
    'handlerName': 'homeController.home',
    'funcHandlerName': 'homeController.home',
    'controllerId': 'homeController',
    'middleware': [],
    'controllerMiddleware': [],
    'requestMetadata': [],
    'responseMetadata': [],
    '_pureRouter': '/',
    '_level': 1
  },
  {
    'prefix': '/',
    'routerName': '',
    'url': '/*',
    'requestMethod': 'get',
    'method': 'home',
    'description': '',
    'summary': '',
    'handlerName': 'homeController.home',
    'funcHandlerName': 'homeController.home',
    'controllerId': 'homeController',
    'middleware': [],
    'controllerMiddleware': [],
    'requestMetadata': [],
    'responseMetadata': [],
    '_pureRouter': '/',
    '_level': 1
  }
];

exports.routerList3 = [
  {
    prefix: '/',
    url: '/:page/page'
  },
  {
    prefix: '/',
    url: '/page/:page'
  },
  {
    prefix: '/',
    url: '/:category/:slug'
  }
];

exports.routerList4 = [
  {
    prefix: '/',
    url: '/page/:page'
  },
  {
    prefix: '/',
    url: '/:page/page'
  },
  {
    prefix: '/',
    url: '/:category/:slug'
  }
];

exports.routerList5 = [
  {
    prefix: '/',
    url: '/detail/:id.html'
  },
  {
    prefix: '/',
    url: '/:typeid/:area/'
  }
];

