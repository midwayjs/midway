const UPPERCASE = /[\p{Lu}]/u;
const LOWERCASE = /[\p{Ll}]/u;
const IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
const SEPARATORS = /[_.\- ]+/;

const LEADING_SEPARATORS = new RegExp('^' + SEPARATORS.source);
const SEPARATORS_AND_IDENTIFIER = new RegExp(
  SEPARATORS.source + IDENTIFIER.source,
  'gu'
);
const NUMBERS_AND_IDENTIFIER = new RegExp('\\d+' + IDENTIFIER.source, 'gu');

const preserveCamelCase = (string, toLowerCase, toUpperCase) => {
  let isLastCharLower = false;
  let isLastCharUpper = false;
  let isLastLastCharUpper = false;

  for (let index = 0; index < string.length; index++) {
    const character = string[index];

    if (isLastCharLower && UPPERCASE.test(character)) {
      string = string.slice(0, index) + '-' + string.slice(index);
      isLastCharLower = false;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = true;
      index++;
    } else if (
      isLastCharUpper &&
      isLastLastCharUpper &&
      LOWERCASE.test(character)
    ) {
      string = string.slice(0, index - 1) + '-' + string.slice(index - 1);
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = false;
      isLastCharLower = true;
    } else {
      isLastCharLower =
        toLowerCase(character) === character &&
        toUpperCase(character) !== character;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper =
        toUpperCase(character) === character &&
        toLowerCase(character) !== character;
    }
  }

  return string;
};

const postProcess = (input, toUpperCase) => {
  SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
  NUMBERS_AND_IDENTIFIER.lastIndex = 0;

  return input
    .replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) =>
      toUpperCase(identifier)
    )
    .replace(NUMBERS_AND_IDENTIFIER, m => toUpperCase(m));
};

function camelCaseOrigin(
  input: string,
  options?: {
    pascalCase?: boolean;
  }
): string {
  options = {
    pascalCase: false,
    ...options,
  };

  input = input.trim();

  if (input.length === 0) {
    return '';
  }

  const toLowerCase = string => string.toLowerCase();
  const toUpperCase = string => string.toUpperCase();

  if (input.length === 1) {
    if (SEPARATORS.test(input)) {
      return '';
    }
    return options.pascalCase ? toUpperCase(input) : toLowerCase(input);
  }

  const hasUpperCase = input !== toLowerCase(input);

  if (hasUpperCase) {
    input = preserveCamelCase(input, toLowerCase, toUpperCase);
  }

  input = input.replace(LEADING_SEPARATORS, '');

  input = toLowerCase(input);

  if (options.pascalCase) {
    input = toUpperCase(input.charAt(0)) + input.slice(1);
  }

  return postProcess(input, toUpperCase);
}

export function camelCase(input: string): string {
  return camelCaseOrigin(input, {
    pascalCase: false,
  });
}

export function pascalCase(input: string): string {
  return camelCaseOrigin(input, {
    pascalCase: true,
  });
}
