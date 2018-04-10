var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.DragText'] = (function ($) {
  return {
    1: {
      1: {
        contentUpgrade: function (parameters, finished) {
          // Moved all behavioural settings into "behaviour" group.
          parameters.behaviour = {
            enableRetry: parameters.enableTryAgain === undefined ? true : parameters.enableTryAgain,
            enableSolutionsButton: parameters.enableShowSolution === undefined ? true : parameters.enableShowSolution,
            instantFeedback: parameters.instantFeedback === undefined ? false : parameters.instantFeedback
          };
          delete parameters.enableTryAgain;
          delete parameters.enableShowSolution;
          delete parameters.instantFeedback;

          finished(null, parameters);
        }
      },

      /**
       * Asynchronous content upgrade hook.
       * Upgrades content parameters to support DragText 1.6
       *
       * Move old feedback message to the new overall feedback system.
       *
       * @param {object} parameters
       * @param {function} finished
       */
      6: function (parameters, finished) {
        if (parameters && parameters.score) {
          parameters.overallFeedback = [
            {
              'from': 0,
              'to': 100,
              'feedback': parameters.score
            }
          ];

          delete parameters.score;
        }

        finished(null, parameters);
      },
      7: function (parameters, finished, extras) {
        var title = (parameters) ? parameters.taskDescription : 'Drag the Words';
        if (title) {
          title = title.replace(/<[^>]*>?/g, '');
        }
        extras = extras || {};
        extras.metadata = extras.metadata || {};
        extras.metadata.title = title;

        finished(null, parameters, extras);
      }
    }
  };
})(H5P.jQuery);
