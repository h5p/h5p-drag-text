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
  var FOOTER_CONTAINER = "h5p-word-footer";
  var EVALUATION_CONTAINER = "h5p-word-evaluation-container";
  var BUTTON_CONTAINER = "h5p-button-bar";
  var DROPZONE_CONTAINER = "h5p-dropzone-container";

  //Special Sub-containers:
  var EVALUATION_SCORE = "h5p-word-evaluation-score";
  var EVALUATION_EMOTICON = "h5p-word-evaluation-score-emoticon";
  var EVALUATION_EMOTICON_MAX_SCORE = "max-score";
  var DROPZONE = "h5p-dropzone";

  //CSS Buttons:
  var BUTTONS = "h5p-button";
  var CHECK_BUTTON = "h5p-check-button";
  var RETRY_BUTTON = "h5p-retry-button";

  //CSS Dropzone feedback:
  var CORRECT_FEEDBACK = 'h5p-correct-feedback';
  var WRONG_FEEDBACK = 'h5p-wrong-feedback';

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
      enableCheckAnswer: true,
      tryAgain: "Retry",
      enableTryAgain: true,
      score: "Score : @score of @total.",
      showSolution : "Show Solution",
      enableShowSolution: true,
      instantFeedback: false
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

    // Add score and button containers.
    this.addFooter();
  };

  /**
   * Append footer to inner block.
   */
  C.prototype.addFooter = function () {
    this.$footer = $('<div class=' + FOOTER_CONTAINER + '></div>').appendTo(this.$inner);
    this.$evaluation = $('<div class=' + EVALUATION_CONTAINER + '></div>').appendTo(this.$footer);
    this.addButtons();
  };

  /**
   * Add check solution and retry buttons.
   */
  C.prototype.addButtons = function () {
    var self = this;
    self.$buttonContainer = $('<div/>', {'class': BUTTON_CONTAINER});

    var $checkAnswerButton = $('<button/>', {
      class: BUTTONS+' '+CHECK_BUTTON,
      type: 'button',
      text: this.params.checkAnswer
    }).appendTo(self.$buttonContainer).click(function () {
      self.showEvaluation();
      if (!self.showEvaluation() && self.params.enableTryAgain) {
        $retryButton.show();
      }
      else {
        $retryButton.hide();
        $checkAnswerButton.hide();
      }
    });

    var $retryButton =  $('<button/>', {
      class: BUTTONS+' '+RETRY_BUTTON,
      type: 'button',
      text: this.params.tryAgain
    }).appendTo(self.$buttonContainer).click(function () {
      self.resetTask();
      self.hideEvaluation();
      $retryButton.hide();
      if (self.params.enableCheckAnswer) {
        $checkAnswerButton.show();
      }
    });

    if (!self.params.enableCheckAnswer) {
      $checkAnswerButton.hide();
    }

    self.$buttonContainer.appendTo(self.$footer);
  };

  /**
   * Resets the buttons back to their original position.
   */
  C.prototype.resetTask = function () {
    this.draggablesArray.forEach(function (entry) {
      entry.resetPosition();
    });
  };

  /**
   * Evaluate task and display score text for word markings.
   *
   * @return {Boolean} Returns true if maxScore was achieved.
   */
  C.prototype.showEvaluation = function () {
    this.hideEvaluation();
    this.calculateScore();

    var score = this.correctAnswers;
    var maxScore = this.droppablesArray.length;

    var scoreText = this.params.score.replace(/@score/g, score.toString())
      .replace(/@total/g, maxScore.toString());

    //Append evaluation emoticon and score to evaluation container.
    $('<div class='+EVALUATION_EMOTICON+'></div>').appendTo(this.$evaluation);
    $('<div class=' + EVALUATION_SCORE + '>' + scoreText + '</div>').appendTo(this.$evaluation);

    if (score === maxScore) {
      this.$evaluation.addClass(EVALUATION_EMOTICON_MAX_SCORE);
      this.disableDraggables();
    }
    else {
      this.$evaluation.removeClass(EVALUATION_EMOTICON_MAX_SCORE);
    }
    return score === maxScore;
  };

  /**
   * Calculate score and store them in class variables.
   */
  C.prototype.calculateScore = function () {
    var self = this;
    self.correctAnswers = 0;
    self.droppablesArray.forEach(function (entry) {
      if(entry.isCorrect()) {
        self.correctAnswers += 1;
      }
    });
  };

  /**
   * Clear the evaluation text.
   */
  C.prototype.hideEvaluation = function () {
    this.$evaluation.html('');
  };
  
  /**
   * Handle task and add it to container.
   * @param {jQuery} $container The object which our task will attach to.
   */
  C.prototype.addTaskTo = function ($container) {
    var self = this;
    self.clozeIndex = 0;
    self.clozesArray = [];
    self.droppablesArray = [];
    self.draggablesArray = [];

    self.$draggables = $('<div/>', {
      class: 'draggables-container'
    });
    self.$wordContainer = $('<div/>', {'class': WORDS_CONTAINER});
    self.handleText();

    //$wordContainer.html(textField);
    self.$wordContainer.appendTo($container);
    self.$draggables.appendTo($container);
  };

  C.prototype.handleText = function () {
    var self = this;
    var textField = self.params.textField;
    // Go through the text and replace all the asterisks with input fields
    var clozeStart = textField.indexOf('*');
    var clozeEnd = textField.indexOf('*');
    var currentIndex = 0;
    while (clozeStart !== -1 && clozeEnd !== -1) {
      clozeStart++;
      clozeEnd = textField.indexOf('*', clozeStart);
      if (clozeEnd === -1) {
        continue; // No end
      }
      // Create new cloze
      self.clozeIndex++;
      self.$wordContainer.append(textField.slice(currentIndex, clozeStart - 1));
      self.addCloze(textField.substring(clozeStart, clozeEnd));
      clozeEnd++;
      currentIndex = clozeEnd;

      // Find the next cloze
      clozeStart = textField.indexOf('*', clozeEnd);
    }
    self.$wordContainer.append(textField.slice(currentIndex, textField.length-1));
  };

  C.prototype.addCloze = function (text) {
    var self = this;
    var tip = undefined;
    var answer = text;
    var answersAndTip = answer.split(':');

    if(answersAndTip.length > 0) {
      answer = answersAndTip[0];
      tip = answersAndTip[1];
    }

    var draggable = new Draggable(answer, self.clozeIndex);
    draggable.appendDraggableTo(self.$draggables);
    var droppable = new Droppable(answer, tip, draggable, self.draggablesArray, self.params.instantFeedback);
    droppable.appendDroppableTo(self.$wordContainer);
    self.draggablesArray.push(draggable);
    self.droppablesArray.push(droppable);
  };

  C.prototype.disableDraggables = function () {
    this.draggablesArray.forEach( function (entry) {
      entry.disableDraggable();
    });
  };

  function Draggable(text, initialPosition) {
    var self = this;
    self.text = text;
    self.initialPosition = initialPosition;
    self.$draggable = null;
    self.insideDropzone = null;

    self.createDraggable();
  }

  Draggable.prototype.disableDraggable = function () {
    this.$draggable.draggable({ disabled: true});
  };

  Draggable.prototype.createDraggable = function () {
    var self = this;
    this.$draggable = $('<span/>', {
      html: this.text
    }).draggable({
        revert: function (isValidDrop) {
          this.data("uiDraggable").originalPosition = {
            top: 0,
            left: 0
          };
          if (!isValidDrop) {
            self.removeFromZone();
            return true;
          }
        }
    });
  };

  Draggable.prototype.appendDraggableTo = function ($container) {
    this.$draggable.appendTo($container);
  };

  Draggable.prototype.getDraggableElement = function () {
    return this.$draggable;
  };

  Draggable.prototype.resetPosition = function () {
    this.removeFromZone();
    this.$draggable.css({ left: 0, top:0 });
  };

  Draggable.prototype.removeFromZone = function () {
    if (this.insideDropzone !== null) {
      this.insideDropzone.removeDraggable();
    }
  };

  Draggable.prototype.setZone = function (zone) {
    this.insideDropzone = zone;
  };

  Draggable.prototype.addToZone = function (droppable) {
    if (this.insideDropzone !== null) {
      this.insideDropzone.removeDraggable();
    }
    this.insideDropzone = droppable;
  };

  function Droppable(text, tip, correctDraggable, draggablesArray, instantFeedback) {
    var self = this;
    self.correctDraggable = correctDraggable;
    self.draggablesArray = draggablesArray;
    self.instantFeedback = instantFeedback;
    self.text = text;
    self.tip = tip;
    self.containedDraggable = null;
    self.$dropzoneContainer = null;

    self.createDroppable();
  }

  Droppable.prototype.createDroppable = function () {
    var self = this;
    self.$dropzoneContainer = $('<span/>', {
      class: DROPZONE_CONTAINER
    });

    $('<input/>', {
      class: DROPZONE,
      disabled: true
    }).droppable({
      drop: function (event, ui) {
        self.draggablesArray.forEach( function (entry) {
          if (entry.getDraggableElement().is(ui.draggable)) {
            self.setDraggable(entry);
          }
        });
      }
    }).appendTo(self.$dropzoneContainer);

    if(self.tip !== undefined) {
      self.$dropzoneContainer.append(H5P.JoubelUI.createTip(self.tip, self.$dropzoneContainer));
    }
  };

  Droppable.prototype.appendDroppableTo = function ($container) {
    this.$dropzoneContainer.appendTo($container);
  };

  Droppable.prototype.setDraggable = function(droppedDraggable) {
    var self = this;
    if (self.containedDraggable === droppedDraggable) {
      return;
    }
    if (self.containedDraggable !== null) {
      self.containedDraggable.resetPosition();
    }
    self.containedDraggable = droppedDraggable;
    droppedDraggable.addToZone(this);
    if (self.instantFeedback) {
      self.setFeedback();
      self.isAllFilled();
    }
  };

  Droppable.prototype.isAllFilled = function () {
    var self = this;
    var allFilled = true;
    self.draggablesArray.forEach(function (entry) {
      if (entry.insideDropzone === null) {
        allFilled = false;
        //Searches for the retry button and hides it.
        self.$dropzoneContainer.parent().parent().find("."+RETRY_BUTTON).hide();
        return false;
      }
    });
    if (allFilled){
      //Searches for the retry button and displays it.
      self.$dropzoneContainer.parent().parent().find("."+RETRY_BUTTON).show();
    }
    return true;
  };

  Droppable.prototype.removeDraggable = function () {
    if (this.instantFeedback) {
      this.containedDraggable.setZone(null);
      this.removeFeedback();
      this.isAllFilled();
    }
    this.containedDraggable = null;
  };

  Droppable.prototype.isCorrect = function () {
    if (this.containedDraggable === this.correctDraggable) {
      return true;
    }
  };

  Droppable.prototype.setFeedback = function () {
    if (this.isCorrect()) {
      this.$dropzoneContainer.removeClass(WRONG_FEEDBACK);
      this.$dropzoneContainer.addClass(CORRECT_FEEDBACK);
    }
    else {
      this.$dropzoneContainer.removeClass(CORRECT_FEEDBACK);
      this.$dropzoneContainer.addClass(WRONG_FEEDBACK);
    }
  };

  Droppable.prototype.removeFeedback = function () {
    this.$dropzoneContainer.removeClass(WRONG_FEEDBACK);
    this.$dropzoneContainer.removeClass(CORRECT_FEEDBACK);
  };

    return C;
})(H5P.jQuery);