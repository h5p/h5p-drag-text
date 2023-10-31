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

      8: function (parameters, finished, extras) {
        var title = (parameters) ? parameters.taskDescription : 'Drag the Words';
        extras = extras || {};
        extras.metadata = extras.metadata || {};

        if (title) {
          extras.metadata.title = title.replace(/<[^>]*>?/g, '');
        }

        finished(null, parameters, extras);
      },

      11: function (parameters, finished, extras) {
        if (typeof parameters?.textField === 'string') {
          const asteriskPositions = Array.from(parameters.textField)
            .reduce((indexes, char, index) => {
              return (char === '*') ?
                [...indexes, index] :
                indexes;
            }, []);

            let lookAtIndex = 0;
            let textWithReplacement = '';
            while (lookAtIndex < parameters.textField.length) {
              const currentChar = parameters.textField[lookAtIndex];
              let replacement = currentChar;

              if (currentChar === '/') {
                const nextAsteriskIndex = asteriskPositions
                  .findIndex((position) => position > lookAtIndex);

                if (nextAsteriskIndex % 2 === 1) {
                  replacement = '\\/';
                }
              }

              textWithReplacement = `${textWithReplacement}${replacement}`;
              lookAtIndex++;
            }

            parameters.textField = textWithReplacement;
        }

        finished(null, parameters, extras);
      }
    }
  };
})(H5P.jQuery);
