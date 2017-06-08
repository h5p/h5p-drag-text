var H5P = H5P || {};
H5P.DragText = H5P.DragText || {};

H5P.DragText.StopWatch = (function () {
  /**
   * @class {H5P.DragText.StopWatch}
   * @constructor
   */
  function StopWatch() {
    /**
     * @property {number} duration in ms
     */
    this.duration = 0;
  }

  /**
   * Starts the stop watch
   *
   * @return {H5P.DragText.StopWatch}
   */
  StopWatch.prototype.start = function(){
    /**
     * @property {number}
     */
    this.startTime = Date.now();
    return this;
  };

  /**
   * Stops the stopwatch, and returns the duration in seconds.
   *
   * @return {number}
   */
  StopWatch.prototype.stop = function(){
    this.duration = this.duration + Date.now() - this.startTime;
    return this.passedTime();
  };

  /**
   * Sets the duration to 0
   */
  StopWatch.prototype.reset = function(){
    this.duration = 0;
    this.startTime = Date.now();
  };

  /**
   * Returns the passed time in seconds
   *
   * @return {number}
   */
  StopWatch.prototype.passedTime = function(){
    return Math.round(this.duration / 10) / 100;
  };

  return StopWatch;
})();

export default H5P.DragText.StopWatch;