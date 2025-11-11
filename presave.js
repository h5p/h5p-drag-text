var H5PEditor = H5PEditor || {};
var H5PPresave = H5PPresave || {};

/**
 * Resolve the presave logic for the content type Drag Text
 *
 * @param {object} content
 * @param finished
 * @constructor
 */
H5PPresave['H5P.DragText'] = function (content, finished) {
  const presave = H5PEditor.Presave;
  let score = 0;
  if (isContentValid()) {
    const pattern = /\*.*?\*/g;
    score = content.textField.match(pattern || []).length;
  }

  presave.validateScore(score);

  finished({ maxScore: score });

  /**
   * Check if required parameters is present
   * @return {boolean}
   */
  function isContentValid() {
    return presave.checkNestedRequirements(content, 'content.textField');
  }
};
