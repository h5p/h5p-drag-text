/**
 * Returns a curried version of a function
 *
 * @param {function} fn
 *
 * @return {function}
 */
const curry = function (fn) {
  const arity = fn.length;

  return function f1() {
    const args = Array.prototype.slice.call(arguments, 0);
    if (args.length >= arity) {
      return fn.apply(null, args);
    }

    return function f2() {
      const args2 = Array.prototype.slice.call(arguments, 0);
      return f1.apply(null, args.concat(args2));
    };
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
const startsWith = function (symbol, str) {
  return str.substr(0, 1) === symbol;
};

/**
 * Checks if a ends with a symbol
 *
 * @param {string} symbol
 * @param {string} str
 *
 * @return {boolean}
 */
const endsWith = function (symbol, str) {
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
const cleanCharacter = curry((char, str) => {
  if (startsWith(char, str)) {
    str = str.slice(1);
  }

  if (endsWith(char, str)) {
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
const shuffle = function (array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    const index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    const temp = array[counter];
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
const createElementWithTextPart = function (text) {
  const el = document.createElement('span');
  el.innerHTML = text;
  return el;
};

const debounce = function (callback, delay) {
  let timeout = null;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

export default {
  curry,
  cleanCharacter,
  startsWith,
  endsWith,
  shuffle,
  createElementWithTextPart,
  debounce,
};
