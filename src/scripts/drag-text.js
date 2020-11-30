import { parseText, lex } from './parse-text';
import StopWatch from './stop-watch';
import Util from './util';
import Draggable from './draggable';
import Droppable from './droppable';

import Controls from 'h5p-lib-controls/src/scripts/controls';
import AriaDrag from 'h5p-lib-controls/src/scripts/aria/drag';
import AriaDrop from 'h5p-lib-controls/src/scripts/aria/drop';
import UIKeyboard from 'h5p-lib-controls/src/scripts/ui/keyboard';
import Mouse from 'h5p-lib-controls/src/scripts/ui/mouse';

/**
 * @typedef {object} H5P.DragTextEvent
 * @property {HTMLElement} element The element being dragged
 * @property {HTMLElement} [target] The target element
 */
/**
 * Drag event
 * @event H5P.DragText#drag
 * @type {H5P.DragTextEvent}
 */
/**
 * Drop event
 * @event H5P.DragText#drop
 * @type {H5P.DragTextEvent}
 */
/**
 * Revert event
 * @event H5P.DragText#revert
 * @type {H5P.DragTextEvent}
 */
/**
 * Start event
 * @event H5P.DragText#start
 * @type {H5P.DragTextEvent}
 */
/**
 * Stop event
 * @event H5P.DragText#stop
 * @type {H5P.DragTextEvent}
 */
/**
 * Drag Text module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DragText = (function ($, Question, ConfirmationDialog) {
  //CSS Main Containers:
  var INNER_CONTAINER = "h5p-drag-inner";
  var TASK_CONTAINER = "h5p-drag-task";
  var WORDS_CONTAINER = "h5p-drag-droppable-words";
  var DROPZONE_CONTAINER = "h5p-drag-dropzone-container";
  var DRAGGABLES_CONTAINER = "h5p-drag-draggables-container";

  //Special Sub-containers:
  var DRAGGABLES_WIDE_SCREEN = 'h5p-drag-wide-screen';
  var DRAGGABLE_ELEMENT_WIDE_SCREEN = 'h5p-drag-draggable-wide-screen';

  /**
   * Initialize module.
   *
   * @class H5P.DragText
   * @extends H5P.Question
   * @param {Object} params Behavior settings
   * @param {Number} contentId Content identification
   * @param {Object} contentData Object containing task specific content data
   *
   * @returns {Object} DragText Drag Text instance
   */
  function DragText(params, contentId, contentData) {
    this.$ = $(this);
    this.contentId = contentId;
    this.contentData = contentData;
    Question.call(this, 'drag-text');

    // Set default behavior.
    this.params = $.extend(true, {
      taskDescription: "Set in adjectives in the following sentence",
      textField: "This is a *nice*, *flexible* content type, which allows you to highlight all the *wonderful* words in this *exciting* sentence.\n" +
        "This is another line of *fantastic* text.",
      overallFeedback: [],
      checkAnswer: "Check",
      tryAgain: "Retry",
      behaviour: {
        enableRetry: true,
        enableSolutionsButton: true,
        enableCheckButton: true,
        instantFeedback: false
      },
      showSolution : "Show solution",
      dropZoneIndex: "Drop Zone @index.",
      empty: "Empty.",
      contains: "Drop Zone @index contains draggable @draggable.",
      ariaDraggableIndex: "@index of @count.",
      tipLabel: "Show tip",
      correctText: "Correct!",
      incorrectText: "Incorrect!",
      resetDropTitle: "Reset drop",
      resetDropDescription: "Are you sure you want to reset this drop zone?",
      grabbed: "Draggable is grabbed.",
      cancelledDragging: "Cancelled dragging.",
      correctAnswer: "Correct answer:",
      scoreBarLabel: 'You got :num out of :total points',
      a11yCheck: 'Check the answers. The responses will be marked as correct, incorrect, or unanswered.',
      a11yShowSolution: 'Show the solution. The task will be marked with its correct solution.',
      a11yRetry: 'Retry the task. Reset all responses and start the task over again.',
    }, params);

    this.contentData = contentData;
    if (this.contentData !== undefined && this.contentData.previousState !== undefined && this.contentData.previousState.length !== undefined) {
      this.previousState = this.contentData.previousState;
    }

    // Keeps track of if Question has been answered
    this.answered = false;
    this.instantFeedbackEvaluationFilled = false;

    // Convert line breaks to HTML
    this.textFieldHtml = this.params.textField.replace(/(\r\n|\n|\r)/gm, "<br/>");

    // introduction field id
    this.introductionId = 'h5p-drag-text-' + contentId + '-introduction';

    /**
     * @type {HTMLElement} selectedElement
     */
    this.selectedElement = undefined;

    // Init keyboard navigation
    this.ariaDragControls = new AriaDrag();
    this.ariaDropControls = new AriaDrop();
    this.dragControls = new Controls([new UIKeyboard(), new Mouse(), this.ariaDragControls]);
    this.dragControls.useNegativeTabIndex();
    this.dropControls = new Controls([new UIKeyboard(), new Mouse(), this.ariaDropControls]);
    this.dropControls.useNegativeTabIndex();

    // return false to prevent select from happening when draggable is disabled
    this.dragControls.on('before-select', event => !this.isElementDisabled(event.element));

    this.dragControls.on('select', this.keyboardDraggableSelected, this);
    this.dropControls.on('select', this.keyboardDroppableSelected, this);

    // add and remove droppables on start/stop drag from controls
    this.on('start', this.addAllDroppablesToControls, this);
    this.on('revert', this.removeControlsFromEmptyDropZones, this);
    this.on('stop', event => {
      if(!event.data.target) {
        this.removeControlsFromDropZonesIfAllEmpty();
      }
    }, this);
    this.on('drop', this.removeControlsFromEmptyDropZones, this);

    // toggle label for draggable
    this.on('start', event => {
      const element = event.data.element;
      const draggable = this.getDraggableByElement(element);

      // on drag and drop, toggle aria-dropeffect between 'move', and 'none'
      this.toggleDropEffect();
      element.setAttribute('aria-grabbed', 'true')
      this.setDraggableAriaLabel(draggable);
    });

    this.on('stop', event => {
      const element = event.data.element;
      const draggable = this.getDraggableByElement(element);

      // on drag and drop, toggle aria-dropeffect between 'move', and 'none'
      this.toggleDropEffect();
      element.setAttribute('aria-grabbed', 'false')
      this.setDraggableAriaLabel(draggable);
    });

    // on drop, remove all dragging
    this.on('drop', this.ariaDropControls.setAllToNone, this.ariaDropControls);

    // on drop remove element from drag controls
    this.on('drop', function(event) {
      this.dragControls.removeElement(event.data.element);
    }, this);

    // on revert, re add element to drag controls
    this.on('revert', function(event) {
      this.dragControls.insertElementAt(event.data.element, 0);
    }, this);

    this.on('drop', this.updateDroppableElement, this);
    this.on('revert', this.updateDroppableElement, this);

    // Init drag text task
    this.initDragText();

    // Start stop watch
    this.stopWatch = new StopWatch();
    this.stopWatch.start();

    this.on('resize', this.resize, this);

    // toggle the draggable container
    this.on('revert', this.toggleDraggablesContainer, this);
    this.on('drop', this.toggleDraggablesContainer, this);

    // Indicate operations trough read speaker
    this.on('stop', event => {
      if(!event.data.target) {
        this.read(this.params.cancelledDragging);
      }
    });

    // trigger instant feedback
    if (this.params.behaviour.instantFeedback) {
      this.on('revert', () => this.instantFeedbackEvaluation());
    }
  }

  DragText.prototype = Object.create(Question.prototype);
  DragText.prototype.constructor = DragText;

  /**
   * Updates the state of a droppable element
   *
   * @param event
   */
  DragText.prototype.updateDroppableElement = function(event) {
    const dropZone = event.data.target;
    const draggable = event.data.element;
    const droppable = this.getDroppableByElement(dropZone);

    if (dropZone) {
      this.setDroppableLabel(dropZone, draggable.textContent, droppable.getIndex());
    }
  };

  /**
   * Remove controls from dropzones if all is empty
   */
  DragText.prototype.removeControlsFromDropZonesIfAllEmpty = function() {
    if (!this.anyDropZoneHasDraggable()) {
      this.removeAllDroppablesFromControls();
    }
  };

  /**
   * Remove controls from dropzones without draggables
   */
  DragText.prototype.removeControlsFromEmptyDropZones = function() {
    this.droppables
      .filter(droppable => !droppable.hasDraggable())
      .map(droppable => droppable.getElement())
      .forEach(el => {
        this.dropControls.removeElement(el);
      });
  };

  /**
   * Add all drop zones to drop keyboard controls
   */
  DragText.prototype.addAllDroppablesToControls = function() {
    // to have a clean start, remove all first
    if(this.dropControls.count() > 0){
      this.removeAllDroppablesFromControls();
    }

    // add droppables in correct order
    this.droppables
      .map(droppable => droppable.getElement())
      .forEach(el => this.dropControls.addElement(el));
  };

  /**
   * Remove all drop zones from drop keyboard controls
   */
  DragText.prototype.removeAllDroppablesFromControls = function() {
    this.droppables
      .map(droppable => droppable.getElement())
      .forEach(el => this.dropControls.removeElement(el));
  };

  /**
   * Remove all drop zones from drop keyboard controls
   */
  DragText.prototype.anyDropZoneHasDraggable = function() {
    return this.droppables.some(droppable => droppable.hasDraggable());
  };

  /**
   * Sets the aria-label of a dropzone based on whether it has a droppable inside it
   *
   * @param {HTMLElement} dropZone
   * @param {string} text
   * @param {number} index
   */
  DragText.prototype.setDroppableLabel = function(dropZone, text, index) {
    const indexText = this.params.dropZoneIndex.replace('@index', index.toString());
    const correctFeedback = dropZone.classList.contains('h5p-drag-correct-feedback');
    const inCorrectFeedback = dropZone.classList.contains('h5p-drag-wrong-feedback');
    const checkButtonPressed = correctFeedback || inCorrectFeedback;
    const hasChildren = (dropZone.childNodes.length > 0);

    if (dropZone) {
      if (checkButtonPressed) {
        const droppable = this.getDroppableByElement(dropZone);
        let resultString = '';
        if (correctFeedback) {
          resultString = droppable.correctFeedback ? droppable.correctFeedback : this.params.correctText;
        }
        else {
          resultString = droppable.incorrectFeedback ? droppable.incorrectFeedback : this.params.incorrectText;
        }
        dropZone.setAttribute('aria-label', `${indexText} ${this.params.contains.replace('@index', index.toString()).replace('@draggable', text)} ${resultString}.`);
      }
      else if (hasChildren) {
        dropZone.setAttribute('aria-label', `${indexText} ${this.params.contains.replace('@index', index.toString()).replace('@draggable', text)}`);
      }
      else {
        dropZone.setAttribute('aria-label',  `${indexText} ${this.params.empty.replace('@index', index.toString())}`);
      }
    }
  };

  /**
   * Registers this question type's DOM elements before they are attached.
   * Called from H5P.Question.
   */
  DragText.prototype.registerDomElements = function () {
    // Register task introduction text
    this.$introduction = $('<p id="' + this.introductionId + '">' + this.params.taskDescription + '</p>');
    this.setIntroduction(this.$introduction);
    this.$introduction.parent().attr('tabindex', '-1');

    // Register task content area
    this.setContent(this.$inner);

    // Register buttons
    this.addButtons();
  };

  /**
   * Initialize drag text task
   */
  DragText.prototype.initDragText = function () {
    this.$inner = $('<div/>', {
      'aria-describedby': this.introductionId,
      'class': INNER_CONTAINER
    });

    // Create task
    this.addTaskTo(this.$inner);

    // Set stored user state
    this.setH5PUserState();

    return this.$inner;
  };

  /**
   * Changes layout responsively when resized.
   */
  DragText.prototype.resize = function () {
    this.changeLayoutToFitWidth();
  };

  /**
  * Adds the draggables on the right side of the screen if widescreen is detected.
  */
  DragText.prototype.changeLayoutToFitWidth = function () {
    var self = this;
    self.addDropzoneWidth();

    //Find ratio of width to em, and make sure it is less than the predefined ratio, make sure widest draggable is less than a third of parent width.
    if ((self.$inner.width() / parseFloat(self.$inner.css("font-size"), 10) > 43) && (self.widestDraggable <= (self.$inner.width() / 3))) {
      // Adds a class that floats the draggables to the right.
      self.$draggables.addClass(DRAGGABLES_WIDE_SCREEN);

      // Detach and reappend the wordContainer so it will fill up the remaining space left by draggables.
      self.$wordContainer.detach().appendTo(self.$taskContainer);

      // Set all draggables to be blocks
      self.draggables.forEach(function (draggable) {
        draggable.getDraggableElement().addClass(DRAGGABLE_ELEMENT_WIDE_SCREEN);
      });

      // Set margin so the wordContainer does not expand when there are no more draggables left.
      self.$wordContainer.css({'margin-right': self.$draggables.width()});
    } else {
      // Remove the specific wide screen settings.
      self.$wordContainer.css({'margin-right': 0});
      self.$draggables.removeClass(DRAGGABLES_WIDE_SCREEN);
      self.$draggables.detach().appendTo(self.$taskContainer);
      self.draggables.forEach(function (draggable) {
        draggable.getDraggableElement().removeClass(DRAGGABLE_ELEMENT_WIDE_SCREEN);
      });
    }
  };

  /**
   * Add check solution, show solution and retry buttons, and their functionality.
   */
  DragText.prototype.addButtons = function () {
    var self = this;

    if (self.params.behaviour.enableCheckButton) {
      // Checking answer button
      self.addButton('check-answer', self.params.checkAnswer, function () {
        self.answered = true;
        self.removeAllElementsFromDragControl();

        if (!self.showEvaluation()) {
          if (self.params.behaviour.enableRetry) {
            self.showButton('try-again');
          }
          if (self.params.behaviour.enableSolutionsButton) {
            self.showButton('show-solution');
          }
          self.hideButton('check-answer');
          self.disableDraggables();
        } else {
          self.hideButton('show-solution');
          self.hideButton('try-again');
          self.hideButton('check-answer');
        }

        // Focus top of the task for natural navigation
        self.$introduction.parent().focus();
      }, !self.params.behaviour.instantFeedback, {
        'aria-label': self.params.a11yCheck,
      });
    }

    //Show Solution button
    self.addButton('show-solution', self.params.showSolution, function () {
      self.droppables.forEach(function (droppable) {
        droppable.showSolution();
      });
      self.draggables.forEach(draggable => self.setDraggableAriaLabel(draggable));
      self.disableDraggables();
      self.removeAllDroppablesFromControls();
      self.hideButton('show-solution');
    }, self.initShowShowSolutionButton || false, {
      'aria-label': self.params.a11yShowSolution,
    });

    //Retry button
    self.addButton('try-again', self.params.tryAgain, function () {
      // Reset and shuffle draggables if Question is answered
      if (self.answered) {
        // move draggables to original container
        self.resetDraggables();
      }
      self.answered = false;

      self.hideEvaluation();
      self.hideExplanation();

      self.hideButton('try-again');
      self.hideButton('show-solution');

      if (self.params.behaviour.instantFeedback) {
        self.enableAllDropzonesAndDraggables();
      } else {
        self.showButton('check-answer');
        self.enableDraggables();
      }
      self.hideAllSolutions();

      self.stopWatch.reset();
      self.read(self.params.taskDescription);
    }, self.initShowTryAgainButton || false, {
      'aria-label': self.params.a11yRetry,
    });
  };

  /**
   * Removes keyboard support for all elements left in the draggables
   * list.
   */
  DragText.prototype.removeAllElementsFromDragControl = function () {
    this.dragControls.elements.forEach(element => this.dragControls.removeElement(element));
  };

  /**
   * Handle selected draggable
   *
   * @param {ControlsEvent} event
   *
   * @fires H5P.DragText#start
   */
  DragText.prototype.keyboardDraggableSelected = function (event) {
    var tmp = this.selectedElement;
    var hasSelectedElement = this.selectedElement !== undefined;
    var isSelectedElement = this.selectedElement ===  event.element;

    // un select the selected
    if(hasSelectedElement){
      this.selectedElement = undefined;
      this.trigger('stop', { element: tmp });
    }

    // no previous selected or not the selected one
    if((!hasSelectedElement || !isSelectedElement) && !this.isElementDisabled(event.element)) {
      this.selectedElement = event.element;
      this.trigger('start', { element: event.element });
      this.focusOnFirstEmptyDropZone();
    }
  };

  /**
   * Focuses on the first empty drop zone
   */
  DragText.prototype.focusOnFirstEmptyDropZone = function() {
    const dropZone = this.droppables
      .filter(droppable => !droppable.hasDraggable())[0];
    const element = dropZone.getElement();

    this.dropControls.setTabbable(element);
    element.focus();
  };

  /**
   * Returns true if aria-disabled="true" on the element
   *
   * @param {HTMLElement} element
   *
   * @return {boolean}
   */
  DragText.prototype.isElementDisabled = function (element) {
    return element.getAttribute('aria-disabled') === 'true';
  };

  /**
   * Handle selected droppable
   *
   * @param {ControlsEvent} event
   */
  DragText.prototype.keyboardDroppableSelected = function (event) {
    var self = this;

    var droppableElement = event.element;
    var droppable = self.getDroppableByElement(droppableElement);
    var draggable = self.getDraggableByElement(this.selectedElement);

    var isCorrectInstantFeedback = this.params.behaviour.instantFeedback && droppable && droppable.isCorrect();
    var isShowingFeedback = !this.params.behaviour.instantFeedback && droppable.hasFeedback();

    // if something selected
    if(draggable && droppable && !isCorrectInstantFeedback) {
      var tmp = self.selectedElement;
      // initiate drop
      self.drop(draggable, droppable);

      self.selectedElement = undefined;

      // update selected
      this.trigger('stop', {
        element: tmp,
        target: droppable.getElement()
      });
    }
    else if(droppable && droppable.hasDraggable() && !isShowingFeedback && !isCorrectInstantFeedback) {
      var containsDropped = droppableElement.querySelector('[aria-grabbed]');

      this.createConfirmResetDialog(function () {
        self.revert(self.getDraggableByElement(containsDropped));
      }).show();
    }
  };

  /**
   * Initialize drag text task
   */
  DragText.prototype.toggleDraggablesContainer = function () {
    var isEmpty = this.$draggables.children().length === 0;
    this.$draggables.toggleClass('hide', isEmpty);
  };

  /**
   * Opens a confirm dialog, where the user has to confirm that they want to reset a droppable
   *
   * @param {function} callback
   * @param {object} [scope]
   *
   * @returns {ConfirmationDialog}
   */
  DragText.prototype.createConfirmResetDialog = function (callback, scope) {
    var self = this;
    var dialog = new ConfirmationDialog({
      headerText: self.params.resetDropTitle,
      dialogText: self.params.resetDropDescription
    });

    dialog.appendTo(document.body);
    dialog.on('confirmed', callback, scope || this);

    return dialog;
  };

  /**
   * Shows feedback for dropzones.
   */
  DragText.prototype.showDropzoneFeedback = function () {
    this.droppables.forEach(droppable => {
      droppable.addFeedback();
      const draggable = droppable.containedDraggable;

      if (droppable && draggable) {
        this.setDroppableLabel(droppable.getElement(), draggable.getElement().textContent, droppable.getIndex());
        this.setDraggableAriaLabel(draggable);
      }
    });
  };

  /**
   * Generates data that is used to render the explanation container
   * at the bottom of the content type
   */
  DragText.prototype.showExplanation = function () {
    const self = this;
    let explanations = [];

    this.droppables.forEach(droppable => {
      const draggable = droppable.containedDraggable;

      if (droppable && draggable) {
        if (droppable.isCorrect() && droppable.correctFeedback) {
          explanations.push({
            correct: draggable.text,
            text: droppable.correctFeedback
          });
        }

        if (!droppable.isCorrect() && droppable.incorrectFeedback) {
          explanations.push({
            correct: droppable.text,
            wrong: draggable.text,
            text: droppable.incorrectFeedback
          });
        }
      }
    });

    if (explanations.length !== 0) {
      this.setExplanation(explanations, self.params.feedbackHeader);
    }
  };

  /**
   * Evaluate task and display score text for word markings.
   *
   * @param {boolean} [skipXapi] Skip sending xAPI event answered
   *
   * @returns {Boolean} Returns true if maxScore was achieved.
   */
  DragText.prototype.showEvaluation = function (skipXapi) {
    this.hideEvaluation();
    this.showDropzoneFeedback();
    this.showExplanation();

    var score = this.calculateScore();
    var maxScore = this.droppables.length;

    if (!skipXapi) {
      var xAPIEvent = this.createXAPIEventTemplate('answered');
      this.addQuestionToXAPI(xAPIEvent);
      this.addResponseToXAPI(xAPIEvent);
      this.trigger(xAPIEvent);
    }

    var scoreText = H5P.Question.determineOverallFeedback(this.params.overallFeedback, score / maxScore)
      .replace(/@score/g, score.toString())
      .replace(/@total/g, maxScore.toString());

    if (score === maxScore) {
      //Hide buttons and disable task
      this.hideButton('check-answer');
      this.hideButton('show-solution');
      this.hideButton('try-again');
      this.disableDraggables();
    }
    this.trigger('resize');

    // Set feedback score
    this.setFeedback(scoreText, score, maxScore, this.params.scoreBarLabel);

    return score === maxScore;
  };

  /**
   * Returns the number of correct entries
   *
   * @returns {number}
   */
  DragText.prototype.calculateScore = function () {
    return this.droppables.reduce(function (sum, entry) {
      return sum + (entry.isCorrect() ? 1 : 0);
    }, 0);
  };

  /**
   * Clear the evaluation text.
   */
  DragText.prototype.hideEvaluation = function () {
    this.removeFeedback();
    this.trigger('resize');
  };

  /**
   * Remove the explanation container
   */
  DragText.prototype.hideExplanation = function () {
    this.setExplanation();
    this.trigger('resize');
  };

  /**
   * Hides solution text for all dropzones.
   */
  DragText.prototype.hideAllSolutions = function () {
    this.droppables.forEach(function (droppable) {
      droppable.hideSolution();
    });
    this.trigger('resize');
  };

  /**
   * Handle task and add it to container.
   *
   * @param {jQuery} $container The object which our task will attach to.
   */
  DragText.prototype.addTaskTo = function ($container) {
    var self = this;
    self.widest = 0;
    self.widestDraggable = 0;
    self.droppables = [];
    self.draggables = [];

    self.$taskContainer = $('<div/>', {
      'class': TASK_CONTAINER
    });

    self.$draggables = $('<div/>', {
      'class': DRAGGABLES_CONTAINER
    });

    self.$wordContainer = $('<div/>', {'class': WORDS_CONTAINER});

    // parse text
    parseText(self.textFieldHtml)
      .forEach(function(part) {
        if(self.isAnswerPart(part)) {
          // is draggable/droppable
          const solution = lex(part);
          const draggable = self.createDraggable(solution.text);
          const droppable = self.createDroppable(solution.text, solution.tip, solution.correctFeedback, solution.incorrectFeedback);

          // trigger instant feedback
          if (self.params.behaviour.instantFeedback) {
            draggable.getDraggableElement().on('dragstop', function() {
              droppable.addFeedback();
              self.instantFeedbackEvaluation();
            });
          }
        }
        else {
          // is normal text
          var el = Util.createElementWithTextPart(part);
          self.$wordContainer.append(el);
        }
      });

    self.shuffleAndAddDraggables(self.$draggables);
    self.$draggables.appendTo(self.$taskContainer);
    self.$wordContainer.appendTo(self.$taskContainer);
    self.$taskContainer.appendTo($container);
    self.addDropzoneWidth();
  };

  /**
   * Returns true if part starts and ends with an asterisk
   *
   * @param {string} part
   *
   * @returns {boolean}
   */
  DragText.prototype.isAnswerPart = function(part) {
    return Util.startsWith('*', part) && Util.endsWith('*', part);
  };

  /**
   * Matches the width of all dropzones to the widest draggable, and sets widest class variable.
   */
  DragText.prototype.addDropzoneWidth = function () {
    var self = this;
    var widest = 0;
    var widestDragagble = 0;
    var fontSize = parseInt(this.$inner.css('font-size'), 10);
    var staticMinimumWidth = 3 * fontSize;
    var staticPadding = fontSize; // Needed to make room for feedback icons

    //Find widest draggable
    this.draggables.forEach(function (draggable) {
      var $draggableElement = draggable.getDraggableElement();

      //Find the initial natural width of the draggable.
      var $tmp = $draggableElement.clone().css({
        'position': 'absolute',
        'white-space': 'nowrap',
        'width': 'auto',
        'padding': 0,
        'margin': 0
      }).html(draggable.getAnswerText())
        .appendTo($draggableElement.parent());
      var width = $tmp.outerWidth();

      widestDragagble = width > widestDragagble ? width : widestDragagble;

      // Measure how big truncated draggable should be
      if ($tmp.text().length >= 20) {
        $tmp.html(draggable.getShortFormat());
        width = $tmp.width();
      }

      if (width + staticPadding > widest) {
        widest = width + staticPadding;
      }
      $tmp.remove();
    });
    // Set min size
    if (widest < staticMinimumWidth) {
      widest = staticMinimumWidth;
    }
    this.widestDraggable = widestDragagble;
    this.widest = widest;
    //Adjust all droppable to widest size.
    this.droppables.forEach(function (droppable) {
      droppable.getDropzone().width(self.widest);
    });
  };

  /**
   * Makes a drag n drop from the specified text.
   *
   * @param {String} answer Text for the drag n drop.
   *
   * @returns {H5P.TextDraggable}
   */
  DragText.prototype.createDraggable = function (answer) {
    var self = this;

    //Make the draggable
    var $draggable = $('<div/>', {
      html: `<span>${answer}</span>`,
      role: 'button',
      'aria-grabbed': 'false',
      tabindex: '-1'
    }).draggable({
      revert: function(isValidDrop) {
        if (!isValidDrop) {
          self.revert(draggable);
        }
        return false;
      },
      drag: self.propagateDragEvent('drag', self),
      start: self.propagateDragEvent('start', self),
      stop: function (event) {
        self.trigger('stop', {
          element: draggable.getElement(),
          target: event.target
        });
      },
      containment: self.$taskContainer
    }).append($('<span>', {
      'class': 'h5p-hidden-read'
    }));

    var draggable = new Draggable(answer, $draggable, self.draggables.length);
    draggable.on('addedToZone', function () {
      self.triggerXAPI('interacted');
    });

    self.draggables.push(draggable);

    return draggable;
  };

  /**
   * Creates a Droppable
   *
   * @param {string} answer
   * @param {string} [tip]
   *
   * @returns {H5P.TextDroppable}
   */
  DragText.prototype.createDroppable = function (answer, tip, correctFeedback, incorrectFeedback) {
    var self = this;

    var draggableIndex = this.draggables.length;

    //Make the dropzone
    var $dropzoneContainer = $('<div/>', {
      'class': DROPZONE_CONTAINER
    });

    var $dropzone = $('<div/>', {
      'aria-dropeffect': 'none',
      'aria-label':  this.params.dropZoneIndex.replace('@index', draggableIndex.toString()) + ' ' + this.params.empty.replace('@index', draggableIndex.toString()),
      'tabindex': '-1'
    }).appendTo($dropzoneContainer)
      .droppable({
        tolerance: 'pointer',
        drop: function (event, ui) {
          var draggable = self.getDraggableByElement(ui.draggable[0]);
          var droppable = self.getDroppableByElement(event.target);

          /**
           * Note that drop will run for all initialized DragText dropzones globally. Even other
           * DragTexts instances. Thus if no matching draggable or droppable is found
           * for this dropzone we must skip it.
           */
          if (!draggable || !droppable) {
            return;
          }
          self.drop(draggable, droppable);
        }
      });

    var droppable = new Droppable(answer, tip, correctFeedback, incorrectFeedback, $dropzone, $dropzoneContainer, draggableIndex, self.params);
    droppable.appendDroppableTo(self.$wordContainer);

    self.droppables.push(droppable);

    return droppable;
  };

  /**
   * Propagates a jQuery UI event
   *
   * @param {string} part
   * @param {string} object
   * @param {object} event
   *
   * @function
   * @returns {boolean}
   */
  DragText.prototype.propagateDragEvent = Util.curry(function(eventName, self, event) {
    self.trigger(eventName, {
      element: event.target
    });
  });

  /**
   * Resets a draggable
   *
   * @param {H5P.TextDraggable} draggable
   *
   * @fires H5P.DragText#revert
   * @fires Question#resize
   */
  DragText.prototype.revert = function (draggable) {
    var droppable = draggable.removeFromZone();
    var target = droppable ? droppable.getElement() : undefined;
    draggable.revertDraggableTo(this.$draggables);
    this.setDraggableAriaLabel(draggable);

    this.trigger('revert', { element: draggable.getElement(), target: target });
    this.trigger('resize');
  };

  /**
   * Handles dropping an element
   *
   * @param {H5P.TextDraggable} draggable
   * @param {H5P.TextDroppable} droppable
   *
   * @fires H5P.DragText#revert
   * @fires H5P.DragText#drop
   * @fires Question#resize
   */
  DragText.prototype.drop = function (draggable, droppable) {
    var self = this;
    self.answered = true;

    draggable.removeFromZone();

    // if already contains draggable
    var revertedDraggable = droppable.appendInsideDroppableTo(this.$draggables);

    // trigger revert, if revert was performed
    if(revertedDraggable){
      self.trigger('revert', {
        element: revertedDraggable.getElement(),
        target: droppable.getElement()
      });
    }

    droppable.setDraggable(draggable);
    draggable.appendDraggableTo(droppable.getDropzone());

    if (self.params.behaviour.instantFeedback) {
      droppable.addFeedback();
      self.instantFeedbackEvaluation();

      if (!self.params.behaviour.enableRetry || droppable.isCorrect()) {
        droppable.disableDropzoneAndContainedDraggable();
      }
    }

    this.trigger('drop', {
      element: draggable.getElement(),
      target: droppable.getElement()
    });

    this.trigger('resize');

    // Resize seems to set focus to the iframe
    droppable.getElement().focus();
  };

  /**
   * Adds the draggable words to the provided container in random order.
   *
   * @param {jQuery} $container Container the draggables will be added to.
   *
   * @returns {H5P.TextDraggable[]}
   */
  DragText.prototype.shuffleAndAddDraggables = function ($container) {
    return Util.shuffle(this.draggables)
      .map((draggable, index) => draggable.setIndex(index))
      .map(draggable => this.addDraggableToContainer($container, draggable))
      .map(draggable => this.setDraggableAriaLabel(draggable))
      .map(draggable => this.addDraggableToControls(this.dragControls, draggable));
  };

  /**
   * Sets an aria label numbering the draggables
   *
   * @param {H5P.TextDraggable} draggable
   *
   * @return {H5P.TextDraggable}
   */
  DragText.prototype.setDraggableAriaLabel = function (draggable) {
    draggable.updateAriaLabel(this.params.ariaDraggableIndex
      .replace('@index', (draggable.getIndex() + 1).toString())
      .replace('@count', this.draggables.length.toString()));

    return draggable;
  };

  /**
   * Returns true if aria-grabbed="true" on an element
   *
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  DragText.prototype.isGrabbed = function (element) {
    return element.getAttribute("aria-grabbed") === 'true';
  };

  /**
   * Adds the draggable to the container
   *
   * @param {jQuery} $container
   * @param {H5P.TextDraggable} draggable
   *
   * @returns {H5P.TextDraggable}
   */
  DragText.prototype.addDraggableToContainer = function ($container, draggable) {
    draggable.appendDraggableTo($container);
    return draggable;
  };

  /**
   * Adds the element of Draggables to (keyboard) controls
   *
   * @param {H5P.Controls} controls
   * @param {H5P.TextDraggable} draggable
   *
   * @returns {H5P.TextDraggable}
   */
  DragText.prototype.addDraggableToControls = function (controls, draggable) {
    controls.addElement(draggable.getElement());
    return draggable;
  };

  /**
   * Feedback function for checking if all fields are filled, and show evaluation if that is the case.
   */
  DragText.prototype.instantFeedbackEvaluation = function () {
    var self = this;
    var allFilled = self.isAllAnswersFilled();

    if (allFilled) {
      //Shows "retry" and "show solution" buttons.
      if (self.params.behaviour.enableSolutionsButton) {
        self.showButton('show-solution');
      }
      if (self.params.behaviour.enableRetry) {
        self.showButton('try-again');
      }

      // Shows evaluation text
      self.showEvaluation(!self.instantFeedbackEvaluationFilled);
      self.instantFeedbackEvaluationFilled = true;
    } else {
      self.instantFeedbackEvaluationFilled = false;
      //Hides "retry" and "show solution" buttons.
      self.hideButton('try-again');
      self.hideButton('show-solution');

      //Hides evaluation text.
      self.hideEvaluation();
    }
  };

  /**
   * Check if all answers are filled
   *
   * @returns {boolean} allFilled Returns true if all answers are answered
   */
  DragText.prototype.isAllAnswersFilled = function () {
    return this.draggables.every(function(draggable){
      return draggable.isInsideDropZone();
    });
  };

  /**
   * Enables all dropzones and all draggables.
   */
  DragText.prototype.enableAllDropzonesAndDraggables = function () {
    this.enableDraggables();
    this.droppables.forEach(function (droppable) {
      droppable.enableDropzone();
    });
  };

  /**
   * Disables all draggables, user will not be able to interact with them any more.
   */
  DragText.prototype.disableDraggables = function () {
    this.draggables.forEach(function (entry) {
      entry.disableDraggable();
    });
  };

  /**
   * Enables all draggables, user will be able to interact with them again.
   */
  DragText.prototype.enableDraggables = function () {
    this.draggables.forEach(function (entry) {
      entry.enableDraggable();
    });
  };

  /**
   * Used for contracts.
   * Checks if the parent program can proceed. Always true.
   *
   * @returns {Boolean} true
   */
  DragText.prototype.getAnswerGiven = function () {
    return this.answered;
  };

  /**
   * Used for contracts.
   * Checks the current score for this task.
   *
   * @returns {Number} The current score.
   */
  DragText.prototype.getScore = function () {
    return this.calculateScore();
  };

  /**
   * Used for contracts.
   * Checks the maximum score for this task.
   *
   * @returns {Number} The maximum score.
   */
  DragText.prototype.getMaxScore = function () {
    return this.droppables.length;
  };

  /**
   * Get title of task
   *
   * @returns {string} title
   */
  DragText.prototype.getTitle = function () {
    return H5P.createTitle((this.contentData && this.contentData.metadata && this.contentData.metadata.title) ? this.contentData.metadata.title : 'Drag the Words');
  };

  /**
   * Toogles the drop effect based on if an element is selected
   */
  DragText.prototype.toggleDropEffect = function () {
    var hasSelectedElement = this.selectedElement !== undefined;
    this.ariaDropControls[hasSelectedElement ? 'setAllToMove' : 'setAllToNone']();
  };

  /**
   * Returns the Draggable by element
   *
   * @param {HTMLElement} el
   *
   * @returns {H5P.TextDraggable}
   */
  DragText.prototype.getDraggableByElement = function (el) {
    return this.draggables.filter(function(draggable){
      return draggable.$draggable.get(0) === el;
    }, this)[0];
  };

  /**
   * Returns the Droppable by element
   *
   * @param {HTMLElement} el
   *
   * @returns {H5P.TextDroppable}
   */
  DragText.prototype.getDroppableByElement = function (el) {
    return this.droppables.filter(function(droppable){
      return droppable.$dropzone.get(0) === el;
    }, this)[0];
  };

  /**
   * Used for contracts.
   * Sets feedback on the dropzones.
   */
  DragText.prototype.showSolutions = function () {
    this.showEvaluation(true);
    this.droppables.forEach(function (droppable) {
      droppable.addFeedback();
      droppable.showSolution();
    });

    this.removeAllDroppablesFromControls();
    this.disableDraggables();
    //Remove all buttons in "show solution" mode.
    this.hideButton('try-again');
    this.hideButton('show-solution');
    this.hideButton('check-answer');
    this.trigger('resize');
  };

  /**
   * Used for contracts.
   * Resets the complete task back to its' initial state.
   */
  DragText.prototype.resetTask = function () {
    var self = this;
    // Reset task answer
    self.answered = false;
    self.instantFeedbackEvaluationFilled = false;
    //Reset draggables parameters and position
    self.resetDraggables();
    //Hides solution text and re-enable draggables
    self.hideEvaluation();
    self.hideExplanation();
    self.enableAllDropzonesAndDraggables();
    //Show and hide buttons
    self.hideButton('try-again');
    self.hideButton('show-solution');

    if (!self.params.behaviour.instantFeedback) {
      self.showButton('check-answer');
    }
    self.hideAllSolutions();
    this.trigger('resize');
  };

  /**
   * Resets the position of all draggables shuffled.
   */
  DragText.prototype.resetDraggables = function () {
    Util.shuffle(this.draggables).forEach(this.revert, this);
  };

  /**
   * Returns an object containing the dropped words
   *
   * @returns {object} containing indexes of dropped words
   */
  DragText.prototype.getCurrentState = function () {
    // Return undefined if task is not initialized
    if (this.draggables === undefined) {
      return undefined;
    }

    return this.draggables
      .filter(draggable => (draggable.getInsideDropzone() !== null))
      .map(draggable => ({
        draggable: draggable.getInitialIndex(),
        droppable: this.droppables.indexOf(draggable.getInsideDropzone())
      }));
  };

  /**
   * Sets answers to current user state
   */
  DragText.prototype.setH5PUserState = function () {
    const self = this;

    // Do nothing if user state is undefined
    if (this.previousState === undefined) {
      return;
    }

    // Select words from user state
    this.previousState.forEach(indexes => {
      if (!self.isValidIndex(indexes.draggable) || !self.isValidIndex(indexes.droppable)) {
        throw new Error('Stored user state is invalid');
      }

      const moveDraggable = this.getDraggableByInitialIndex(indexes.draggable);
      const moveToDroppable = self.droppables[indexes.droppable];

      self.drop(moveDraggable, moveToDroppable);

      if (self.params.behaviour.instantFeedback) {
        // Add feedback to dropzone
        if (moveToDroppable !== null) {
          moveToDroppable.addFeedback();
        }

        // Add feedback to draggable
        if (moveToDroppable.isCorrect()) {
          moveToDroppable.disableDropzoneAndContainedDraggable();
        }
      }
    });

    // Show evaluation if task is finished
    if (self.params.behaviour.instantFeedback) {

      // Show buttons if not max score and all answers filled
      if (self.isAllAnswersFilled() && !self.showEvaluation()) {

        //Shows "retry" and "show solution" buttons.
        if (self.params.behaviour.enableSolutionsButton) {
          self.initShowShowSolutionButton = true;
        }
        if (self.params.behaviour.enableRetry) {
          self.initShowTryAgainButton = true;
        }
      }
    }
  };

  /**
   * Checks if a number is a valid index
   *
   * @param {number} index
   * @return {boolean}
   */
  DragText.prototype.isValidIndex = function(index) {
    return !isNaN(index) && (index < this.draggables.length) && (index >= 0);
  };

  /**
   * Returns the draggable that initially was at an index
   *
   * @param {number} initialIndex
   * @return {Draggable}
   */
  DragText.prototype.getDraggableByInitialIndex = function(initialIndex) {
    return this.draggables.filter(draggable => draggable.hasInitialIndex(initialIndex))[0];
  };

  /**
   * getXAPIData
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
	 *
   * @returns {Object} xAPI data
   */
  DragText.prototype.getXAPIData = function () {
    var xAPIEvent = this.createXAPIEventTemplate('answered');
    this.addQuestionToXAPI(xAPIEvent);
    this.addResponseToXAPI(xAPIEvent);
    return {
      statement: xAPIEvent.data.statement
    };
  };

  /**
   * addQuestionToXAPI
   * Add the question itself to the definition part of an xAPIEvent
   *
   * @param xAPIEvent
   */
  DragText.prototype.addQuestionToXAPI = function (xAPIEvent) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object','definition']);
    $.extend(definition, this.getxAPIDefinition());
  };

  /**
   * Generate xAPI object definition used in xAPI statements.
   *
   * @returns {Object}
   */
  DragText.prototype.getxAPIDefinition = function () {
    var definition = {};
    definition.interactionType = 'fill-in';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';

    var question = this.textFieldHtml;
    var taskDescription = this.params.taskDescription + '<br/>';

    // Create the description
    definition.description = {
      'en-US': taskDescription + this.replaceSolutionsWithBlanks(question)
    };

    //Create the correct responses pattern
    definition.correctResponsesPattern = [this.getSolutionsFromQuestion(question)];

    return definition;
  };

  /**
   * Add the response part to an xAPI event
   *
   * @param {H5P.XAPIEvent} xAPIEvent
   *  The xAPI event we will add a response to
   */
  DragText.prototype.addResponseToXAPI = function (xAPIEvent) {
    var self = this;
    var currentScore = self.getScore();
    var maxScore = self.droppables.length;
    var duration;

    xAPIEvent.setScoredResult(currentScore, maxScore, self);

    var score = {
      min: 0,
      raw: currentScore,
      max: maxScore,
      scaled: Math.round(currentScore / maxScore * 10000) / 10000
    };

    if(self.stopWatch) {
      duration = 'PT' + self.stopWatch.stop() + 'S';
    }

    xAPIEvent.data.statement.result = {
      response: self.getXAPIResponse(),
      score: score,
      duration: duration,
      completion: true
    };
  };

  /**
   * Generate xAPI user response, used in xAPI statements.
   *
   * @returns {string} User answers separated by the "[,]" pattern
   */
  DragText.prototype.getXAPIResponse = function () {
     return this.droppables
      .map(droppable => droppable.hasDraggable() ? droppable.containedDraggable.text : '')
      .join('[,]');
  };

	/**
	 * replaceSolutionsWithBlanks
	 *
	 * @param {string} question
	 * @returns {string}
	 */
  DragText.prototype.replaceSolutionsWithBlanks = function (question) {
    return parseText(question)
      .map(part => this.isAnswerPart(part) ? '__________' : part)
      .join('');
  };

	/**
	 * Get solutions from question
	 *
	 * @param {string} question
	 * @returns {string} Array with a string containing solutions of a question
	 */
  DragText.prototype.getSolutionsFromQuestion = function (question) {
    return parseText(question)
      .filter(this.isAnswerPart)
      .map(part => lex(part))
      .map(solution => solution.text)
      .join('[,]');
  };

  return DragText;

}(H5P.jQuery, H5P.Question, H5P.ConfirmationDialog));

/**
 * Static helper method to enable parsing of question text into a format useful
 * for generating reports.
 * 
 * PS: The leading backslash for the correct and incorrect feedback within
 * answer parts must be escaped appropriately:
 * 
 * Example:
 * 
 * question: 'H5P content is *interactive\\+Correct! \\-Incorrect, try again!*.'
 * 
 * produces the following:
 * 
 * [
 *   {
 *     type: 'text',
 *     content: 'H5P content is '
 *   },
 *   {
 *     type: 'answer',
 *     correct: 'interactive'  
 *   },
 *   {
 *     type: 'text',
 *     content: '.'
 *   }
 * ]
 * 
 * @param {string} question Question text for an H5P.DragText content item
 */
H5P.DragText.parseText = function (question) {
  const isAnswerPart = function (part) {
    return Util.startsWith('*', part) && Util.endsWith('*', part);
  };
  return parseText(question)
    .map(part => isAnswerPart(part) ?
      ({
        type: 'answer',
        correct: lex(part).text
      }) :
      ({
        type: 'text',
        content: part
      })
    );
};

export default H5P.DragText;
