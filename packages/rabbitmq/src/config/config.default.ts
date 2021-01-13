export default (appInfo: any) => {
  const config: any = {};

  config.rabbitmq = { url: 'amqp://localhost'}

  return config;
};
