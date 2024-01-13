export const midwayLogger = {
  default: {
    enableFile: false,
    enableError: false,
    format: (info: any) => {
      const requestId =
        info.ctx?.['originContext']?.['requestId'] ??
        info.ctx?.['originContext']?.['request_id'] ??
        '';
      return `${new Date().toISOString()} ${requestId} [${info.level}] ${
        info.message
      }`;
    },
  },
};
