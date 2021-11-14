export const midwayLogger = {
  default: {
    disableFile: true,
    disableError: true,
    printFormat: (info: any) => {
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
