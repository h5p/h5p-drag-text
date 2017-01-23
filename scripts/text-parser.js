H5P.DragTextTextParser = (function(){
  var TextParser = function(parent){
    this.parent = parent;
  };

  /**
   * Parses text, and populates Drag Text
   *
   * @param {string} textField
   */
  TextParser.prototype.parse = function (textField) {
    var self = this;
    // Go through the text and replace all the asterisks with input fields
    var dropStart = textField.indexOf('*');
    var dropEnd = -1;
    var currentIndex = 0;
    //While the start of a dropbox is found
    while (dropStart !== -1) {
      dropStart += 1;
      dropEnd = textField.indexOf('*', dropStart);
      if (dropEnd === -1) {
        dropStart = -1;
      } else {
        //Appends the text between each dropzone
        self.parent.$wordContainer.append(textField.slice(currentIndex, dropStart - 1));

        //Adds the drag n drop functionality when an answer is found
        self.parent.addDragNDrop(textField.substring(dropStart, dropEnd));
        dropEnd += 1;
        currentIndex = dropEnd;

        //Attempts to find the beginning of the next answer.
        dropStart = textField.indexOf('*', dropEnd);
      }
    }
    //Appends the remaining part of the text.
    self.parent.$wordContainer.append(textField.slice(currentIndex, textField.length));
  };

  return TextParser;
})();