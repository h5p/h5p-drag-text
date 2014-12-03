var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.DragText'] = (function ($) {
  return {
    1: {
      1: {
        contentUpgrade: function (parameters, finished) {
          // Moved all behavioural settings into "behaviour" group.
          parameters.behaviour = {
            enableRetry: parameters.enableTryAgain,
            enableSolutionsButton: parameters.enableShowSolution,
            instantFeedback: parameters.instantFeedback
          };
          delete parameters.enableTryAgain;
          delete parameters.enableShowSolution;
          delete parameters.instantFeedback;

          finished(null, parameters);
        }
      }
    }
  };
})(H5P.jQuery);