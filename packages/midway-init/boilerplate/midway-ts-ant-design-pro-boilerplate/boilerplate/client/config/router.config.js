export default [
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    routes: [
      { path: '/', redirect: '/form' },
      {
        path: '/form',
        icon: 'form',
        name: '测试',
        component: './Forms/BasicForm',
      },
      {
        component: '404',
      },
    ],
  },
];
