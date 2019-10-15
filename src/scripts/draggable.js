H5P.TextDraggable = (function ($) {
  //CSS Draggable feedback:
  var DRAGGABLE_DROPPED = 'h5p-drag-dropped';
  /**
   * Private class for keeping track of draggable text.
   *
   * @private
   * @param {String} text String that will be turned into a selectable word.
   * @param {jQuery} draggable Draggable object.
   * @param {number} index
   */
  function Draggable(text, draggable, index) {
    H5P.EventDispatcher.call(this);
    var self = this;
    self.text = text;
    self.insideDropzone = null;
    self.$draggable = $(draggable);
    self.$ariaLabel = self.$draggable.find('.h5p-hidden-read');
    self.index = index;
    self.initialIndex = index;

    self.shortFormat = self.text;
    //Shortens the draggable string if inside a dropbox.
    if (self.shortFormat.length > 20) {
      self.shortFormat = self.shortFormat.slice(0, 17) + '...';
    }
  }

  Draggable.prototype = Object.create(H5P.EventDispatcher.prototype);
  Draggable.prototype.constructor = Draggable;

  /**
   * Gets the index
   *
   * @return {number}
   */
  Draggable.prototype.getIndex = function () {
    return this.index;
  };

  /**
   * Sets the index
   *
   * @param {number} index
   * @returns {H5P.TextDraggable}
   */
  Draggable.prototype.setIndex = function (index) {
    this.index = index;
    return this;
  };

  /**
   * Gets the initial index
   *
   * @return {number}
   */
  Draggable.prototype.getInitialIndex = function () {
    return this.initialIndex;
  };


  /**
   * Checks if a index is this droppables initial index
   *
   * @param {number} index
   * @returns {boolean}
   */
  Draggable.prototype.hasInitialIndex = function (index) {
    return this.initialIndex === index;
  };

  /**
   * Moves the draggable to the provided container.
   *
   * @param {jQuery} $container Container the draggable will append to.
   */
  Draggable.prototype.appendDraggableTo = function ($container) {
    this.$draggable.detach().css({left: 0, top: 0}).appendTo($container);
  };

  /**
   * Reverts the draggable to its' provided container.
   *
   * @params {jQuery} $container The parent which the draggable will revert to.
   */
  Draggable.prototype.revertDraggableTo = function ($container) {
    // get the relative distance between draggable and container.
    var offLeft = this.$draggable.offset().left - $container.offset().left;
    var offTop = this.$draggable.offset().top - $container.offset().top;

    // Prepend draggable to new container, but keep the offset,
    // then animate to new container's top:0, left:0
    this.$draggable.detach()
      .prependTo($container)
      .css({left: offLeft, top: offTop})
      .animate({left: 0, top: 0});
  };

  /**
   * Sets dropped feedback if the on the draggable if parameter is true.
   *
   * @params {Boolean} isDropped Decides whether the draggable has been dropped.
   */
  Draggable.prototype.toggleDroppedFeedback = function (isDropped) {
    if (isDropped) {
      this.$draggable.addClass(DRAGGABLE_DROPPED);
    } else {
      this.$draggable.removeClass(DRAGGABLE_DROPPED);
    }
  };

  /**
   * Disables the draggable, making it immovable.
   */
  Draggable.prototype.disableDraggable = function () {
    this.$draggable.draggable({ disabled: true});
  };

  /**
   * Enables the draggable, making it movable.
   */
  Draggable.prototype.enableDraggable = function () {
    this.$draggable.draggable({ disabled: false});
  };

  /**
   * Gets the draggable jQuery object for this class.
   *
   * @returns {jQuery} Draggable item.
   */
  Draggable.prototype.getDraggableElement = function () {
    return this.$draggable;
  };

  /**
   * Update Draggables "aria label"
   * @param {String} label [description]
   */
  Draggable.prototype.updateAriaLabel = function (label) {
    this.$ariaLabel.html(label);
  };

  /**
   * Gets the draggable element for this class.
   *
   * @returns {HTMLElement}
   */
  Draggable.prototype.getElement = function () {
    return this.$draggable.get(0);
  };

  /**
   * Removes this draggable from its dropzone, if it is contained in one,
   * and returns a reference to it
   *
   * @returns {Droppable}
   */
  Draggable.prototype.removeFromZone = function () {
    var dropZone = this.insideDropzone;

    if (this.insideDropzone !== null) {
      this.insideDropzone.removeFeedback();
      this.insideDropzone.removeDraggable();
    }
    this.toggleDroppedFeedback(false);
    this.removeShortFormat();
    this.insideDropzone = null;

    return dropZone;
  };

  /**
   * Adds this draggable to the given dropzone.
   *
   * @param {Droppable} droppable The droppable this draggable will be added to.
   */
  Draggable.prototype.addToZone = function (droppable) {
    if (this.insideDropzone !== null) {
      this.insideDropzone.removeDraggable();
    }
    this.toggleDroppedFeedback(true);
    this.insideDropzone = droppable;
    this.setShortFormat();
    this.trigger('addedToZone');
  };

  /**
   * Gets the answer text for this draggable.
   *
   * @returns {String} The answer text in this draggable.
   */
  Draggable.prototype.getAnswerText = function () {
    return this.text;
  };

  /**
   * Sets short format of draggable when inside a dropbox.
   */
  Draggable.prototype.setShortFormat = function () {
    this.$draggable.html(this.shortFormat);
  };

  /**
   * Get short format of draggable when inside a dropbox.
   *
   * @returns {String|*}
   */
  Draggable.prototype.getShortFormat = function () {
    return this.shortFormat;
  };

  /**
   * Removes the short format of draggable when it is outside a dropbox.
   */
  Draggable.prototype.removeShortFormat = function () {
    this.$draggable.html(this.text);
  };

  /**
   * Get the droppable this draggable is inside
   *
   * @returns {Droppable} Droppable
   */
  Draggable.prototype.getInsideDropzone = function () {
    return this.insideDropzone;
  };

  /**
   * Returns true if inside dropzone
   *
   * @returns {boolean}
   */
  Draggable.prototype.isInsideDropZone = function () {
    return !!this.insideDropzone;
  };

  return Draggable;
})(H5P.jQuery);

export default H5P.TextDraggable;
