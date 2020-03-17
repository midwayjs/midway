export const commandLineUsage = options => {
  if (Array.isArray(options)) {
    return options.map(commandLineUsage).join('\n');
  }
  const result = ['\n'];
  if (options.header) {
    result.push(options.header.replace(/^./, match => match.toUpperCase()));

    if (options.content) {
      result.push(`  ${options.content}`);
    }
    result[result.length - 1] = result[result.length - 1] + '\n';
  }
  const optionsList = [];
  let length = 0;
  if (options.optionList) {
    options.optionList.map(info => {
      const option = `  ${info.alias ? `-${info.alias}, ` : ''}--${info.name}`;
      if (option.length > length) {
        length = option.length + 4;
      }
      optionsList.push({
        option,
        info: info.description || '',
      });
    });
  }
  optionsList.forEach(options => {
    result.push(options.option.padEnd(length, ' ') + options.info + '\n');
  });
  return result.join('\n');
};
