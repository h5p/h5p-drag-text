var H5PEditor = H5PEditor || {};
var H5PPresave = H5PPresave || {};

H5PPresave['H5P.DragText'] = function (content, finished) {
  var presave = H5PEditor.Presave;
  var score = 0;
  if (isContentValid()) {
    var pattern = /\*.*?\*/g;
    score = content.textField.match(pattern || []).length;
  }

  presave.validateScore(score);

  if (finished) {
    finished({maxScore: score});
  }

  function isContentValid() {
    return presave.checkNestedRequirements(content, 'content.textField');
  }
};
