/** Short description of a value for error messages, for example "undefined" or "a number". */
export const describe = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'an array';
  const type = typeof value;
  return type === 'undefined' ? 'undefined' : `a${/^[aeiou]/.test(type) ? 'n' : ''} ${type}`;
};
