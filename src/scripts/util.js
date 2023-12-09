/**
 * Returns a curried version of a function
 *
 * @param {function} fn
 *
 * @return {function}
 */
var curry =function(fn) {
  var arity = fn.length;

  return function f1() {
    var args = Array.prototype.slice.call(arguments, 0);
    if (args.length >= arity) {
      return fn.apply(null, args);
    }
    else {
      return function f2() {
        var args2 = Array.prototype.slice.call(arguments, 0);
        return f1.apply(null, args.concat(args2));
      };
    }
  };
};

/**
 * Checks if a string starts with a symbol
 *
 * @param {string} symbol
 * @param {string} str
 *
 * @return {boolean}
 */
var startsWith = function(symbol, str) {
  return str.substr(0,1) === symbol;
};

/**
 * Checks if a ends with a symbol
 *
 * @param {string} symbol
 * @param {string} str
 *
 * @return {boolean}
 */
var endsWith = function(symbol, str) {
  return str.substr(-1) === symbol;
};

/**
 * Removes a given character in the beginning and end of a string
 *
 * @param {string} char
 * @param {string} str
 *
 * @return {string}
 */
var cleanCharacter = curry(function(char, str) {
  if(startsWith(char, str)) {
    str = str.slice(1);
  }

  if(endsWith(char, str)) {
    str = str.slice(0, -1);
  }

  return str;
});

/**
 * Implements "Fisher-Yates Shuffle" algorithm for arrays
 *
 * @param {Array} array
 *
 * @return {Array}
 */
var shuffle = function (array) {
  var counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    var index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    var temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
};

/**
 * Creates a span HTMLElement containing a text
 *
 * @param {string} text
 *
 * @return {HTMLElement}
 */
var createElementWithTextPart = function(text) {
  var el = document.createElement('span');
  el.innerHTML = text;
  return  el;
};

/**
 * Split a text string into an array of segments using a specified separator while allowing for escaped separators using an escape character.
 * @param {string} text The text to be split into segments.
 * @param {string} [separator] The separator character to split the text (default is '/').
 * @param {string} [escapeChar] The escape character used to escape the separator (default is '\').
 * @returns {string[]} An array of segments split from the text.
 */
const splitIgnoreEscaped = (text, separator = '/', escapeChar = '\\\\') => {
  // escapeChar looks duplicated because it's used in regular expression
  const unlikelyReplacement = `${H5P.createUUID()}-${H5P.createUUID()}`;

  return text
    .replace(new RegExp(`${escapeChar}${separator}`, 'g'), unlikelyReplacement)
    .split(separator)
    .map((splitSegment) => {
      return splitSegment
        .replace(new RegExp(unlikelyReplacement, 'g'), separator);
    });
}

export default {
  curry: curry,
  cleanCharacter: cleanCharacter,
  startsWith: startsWith,
  endsWith: endsWith,
  shuffle: shuffle,
  createElementWithTextPart: createElementWithTextPart,
  splitIgnoreEscaped: splitIgnoreEscaped
};
