var H5P = H5P || {};

/**
 * Drag Text module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DragText = (function ($) {
  //CSS Main Containers:
  var MAIN_CONTAINER = "h5p-word";
  var INNER_CONTAINER = "h5p-word-inner";
  var TITLE_CONTAINER = "h5p-word-title";
  var WORDS_CONTAINER = "h5p-word-selectable-words";

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   *
   * @returns {Object} C Drag Text instance
   */
  function C(params, id) {
    this.$ = $(this);
    this.id = id;

    // Set default behavior.
    this.params = $.extend({}, {
      taskDescription: "Set in adjectives in the following sentence",
      textField: "This is a *nice*, *flexible* content type, which allows you to highlight all the *wonderful* words in this *exciting* sentence.\n"+
        "This is another line of *fantastic* text.",
      checkAnswer: "Check",
      tryAgain: "Retry",
      score: "Score : @score of @total, correct: @correct, wrong: @wrong, missed: @missed."
    }, params);
  }

  /**
   * Append field to wrapper.
   * @param {jQuery} $container the jQuery object which this module will attach itself to.
   */
  C.prototype.attach = function ($container) {
    this.$inner = $container.addClass(MAIN_CONTAINER)
        .html('<div class=' + INNER_CONTAINER + '><div class=' + TITLE_CONTAINER + '>' + this.params.taskDescription + '</div></div>')
        .children();
    this.addTaskTo(this.$inner);
  };
  
  /**
   * Handle task and add it to container.
   * @param {jQuery} $container The object which our task will attach to.
   */
  C.prototype.addTaskTo = function ($container) {
    var self = this;
    var textField = self.params.textField;
    self.clozeIndex = 0;
    self.clozesArray = [];
    self.droppablesArray = [];
    self.draggablesArray = [];

    self.$draggables = $('<div/>', {
      class: 'draggables-container'
    });
    self.$wordContainer = $('<div/>', {'class': WORDS_CONTAINER});

    // Go through the text and replace all the asterisks with input fields
    var clozeEnd, clozeStart = textField.indexOf('*');
    var currentIndex = 0;
    while (clozeStart !== -1 && clozeEnd !== -1) {
      clozeStart++;
      clozeEnd = textField.indexOf('*', clozeStart);
      if (clozeEnd === -1) {
        continue; // No end
      }
      // Create new cloze
      self.clozeIndex++;
      self.addCloze(textField.substring(clozeStart, clozeEnd));

      clozeEnd++;

      self.$wordContainer.append(textField.slice(currentIndex, clozeStart - 1));
      currentIndex = clozeEnd;


      // Find the next cloze
      clozeStart = textField.indexOf('*', clozeEnd);
    }
    self.$wordContainer.append(textField.slice(currentIndex, textField.length-1));

    //$wordContainer.html(textField);
    self.$wordContainer.appendTo($container);
    self.$draggables.appendTo($container);
  };

  C.prototype.addCloze = function (answer) {
    var self = this;
    var tip = undefined;
    var answer = answer;
    var answersAndTip = answer.split(':');

    if(answersAndTip.length > 0) {
      answer = answersAndTip[0];
      tip = answersAndTip[1];
    }

    var $dropZone = $('<input/>', {
      class: 'h5p-dropzone',
      disabled: true
    }).droppable({
      drop: function (event, ui) {
        self.draggablesArray.forEach( function (entry) {
          if (entry.getDraggableElement().is(ui.draggable)) {
            droppable.setDraggable(entry);
          }
        });
      }
    });

    var $draggableWord = $('<span/>', {
      html: 'draggable'
    }).appendTo(self.$draggables)
      .draggable({
        revert: "invalid"
      }
    );

    var draggable = new Draggable($draggableWord, self.clozeIndex, self.$draggables);
    var droppable = new Droppable($dropZone, draggable);
    self.draggablesArray.push(draggable);
    self.droppablesArray.push(droppable);

    self.$wordContainer.append($dropZone);
  };

  function Draggable($draggable, initialPosition, $container) {
    var self = this;
    self.isInDropZone = false;
    self.$container = $container;
    self.isInCorrectDropZone = false;
    self.initialPosition = initialPosition;
    self.$draggable = $draggable;
    self.insideDropzone = null;

  }

  Draggable.prototype.getDraggableElement = function () {
    return this.$draggable;
  };

  Draggable.prototype.resetPosition = function () {
    //Put this object before the item with higher
    // initialPosition than this in the remaining draggables.
    this.removeFromZone();
    this.$draggable.css({ left: 0, top:0 });
  };

  Draggable.prototype.removeFromZone = function () {
    this.insideDropzone.removeDraggable();
    this.isInDropZone = false;
    this.insideDropzone = null;

  };

  Draggable.prototype.addToZone = function (droppable) {
    if (this.isInDropZone) {
      this.insideDropzone.removeDraggable();
    }
    this.isInDropZone = true;
    this.insideDropzone = droppable;
  }

  function Droppable($droppable, correctDraggable) {
    this.correctDraggable = correctDraggable;
    var isCorrect = false;
    var hasDraggable = false;
    this.containedDraggable = null;
  }

  Droppable.prototype.setDraggable = function(droppedDraggable) {
    if (this.containedDraggable === droppedDraggable) {
      return;
    }
    else if (this.containedDraggable === null) {
      droppedDraggable.addToZone(this);
      this.containedDraggable = droppedDraggable;
    }
    else {
      this.containedDraggable.resetPosition();
      this.containedDraggable = droppedDraggable;
      droppedDraggable.addToZone(this);
    }
  };

  Droppable.prototype.removeDraggable = function () {
    this.containedDraggable = null;
  }


    return C;
})(H5P.jQuery);