const ErrorMap = {
  commandIsEntrypoint: (info: any) => {
    return {
      info,
      message: `command ${info.command} is entrypoint, cannot invoke`,
    };
  },
  commandNotFound: (info: any) => {
    return {
      info,
      message: `command ${info.command} not found`,
    };
  },
  localPlugin: (info: any) => {
    return {
      info,
      message: `load local plugin '${info.path}' error '${info.err.message}'`,
    };
  },
  npmPlugin: (info: any) => {
    return {
      info,
      message: `load npm plugin '${info.path}' error '${info.err.message}'`,
    };
  },
  pluginType: (info: string) => {
    return {
      info,
      message: `only support npm / local / class plugin`,
    };
  },
};

interface ReturnValue<T> {
  info: T;
  message: string;
}

export default <T>(type: string, info: T): ReturnValue<T> => {
  const error = ErrorMap[type];
  if (!error) {
    return {
      info,
      message: `error`,
    };
  }
  return error(info);
};
