H5P.DragTextTextParser = (function(){
  var TextParser = function(){
    this.nextDraggableRegex = /\*(.*?)\*/;
  };

  /**
   * Parses a text into an array where words starting and ending
   * with an asterisk are separated from other text.
   * e.g ["this", "*is*", " an ", "*example*"]
   *
   * @param {string} text
   *
   * @return {string[]}
   */
  TextParser.prototype.parse = function (text) {
    var next = this.findNextDraggable(text);

    if(next) {
      var parts = text.split(next);
      return [parts[0], next].concat(this.parse(parts[1]))
    }
    else {
      return [text];
    }
  };

  /**
   * Finds the next draggable in a string
   *
   * @param {string} text
   * @return {string|null}
   */
  TextParser.prototype.findNextDraggable = function(text){
    var draggable = this.nextDraggableRegex.exec(text);
    return draggable ? draggable[0] : null;
  };

  return TextParser;
})();