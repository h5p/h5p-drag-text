/**
 * Parses a text into an array where words starting and ending
 * with an asterisk are separated from other text.
 * e.g ["this", "*is*", " an ", "*example*"]
 *
 * @param {string} text
 *
 * @return {string[]}
 */
export default text => text.split(/(\*.*?\*)/).filter(str => str.length > 0);