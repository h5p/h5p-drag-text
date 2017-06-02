/**
 * String parser for drag text
 */
export default class TextParser {
  constructor() {
    this.nextDraggableRegex = /\*(.*?)\*/;
  }

  /**
   * Parses a text into an array where words starting and ending
   * with an asterisk are separated from other text.
   * e.g ["this", "*is*", " an ", "*example*"]
   *
   * @param {string} text
   *
   * @return {string[]}
   */
  parse(text) {
    const draggable = this.findNextDraggable(text);

    if(draggable) {
      const [before, after] = text.split(draggable);
      return [before, draggable, ...(this.parse(after))].filter(this.notEmpty)
    }
    else {
      return [text];
    }
  }

  /**
   * Finds the next draggable in a string
   *
   * @param {string} text
   * @return {string|null}
   */
  findNextDraggable(text) {
    const draggable = this.nextDraggableRegex.exec(text);
    return draggable ? draggable[0] : null;
  }

  /**
   * Returns true if the string is non-empty
   *
   * @param {string} str
   *
   * @return {boolean}
   */
  notEmpty(str) {
    return str && str.length > 0;
  }
}