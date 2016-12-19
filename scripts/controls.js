// [AIV] Build version: 1.0.0 
 /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Load library
	H5P.Controls = __webpack_require__(1).default;
	H5P.Controls.UIKeyboard = __webpack_require__(5).default;
	H5P.Controls.AriaDrag = __webpack_require__(6).default;
	H5P.Controls.AriaDrop = __webpack_require__(7).default;
	H5P.Controls.AriaSelected = __webpack_require__(8).default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _elements = __webpack_require__(2);

	var _functional = __webpack_require__(3);

	var _events = __webpack_require__(4);

	var _events2 = _interopRequireDefault(_events);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Controls Event
	 * @typedef {Object} ControlsEvent
	 * @property {HTMLElement} element
	 * @property {number} index
	 * @property {HTMLElement[]} elements
	 * @property {HTMLElement} oldElement
	 */
	/**
	 * Previous element event
	 * @event Controls#previousElement
	 * @type ControlsEvent
	 */
	/**
	 * Next element event
	 * @event Controls#nextElement
	 * @type ControlsEvent
	 */
	/**
	 * Select option event
	 * @event Controls#select
	 * @type ControlsEvent
	 */

	/**
	 * @class
	 */
	var Controls = function (_Events) {
	  _inherits(Controls, _Events);

	  function Controls(plugins) {
	    _classCallCheck(this, Controls);

	    /**
	     *@property {HTMLElement} tabbableElement
	     */
	    /**
	     * @property {object[]} plugins
	     */
	    var _this = _possibleConstructorReturn(this, (Controls.__proto__ || Object.getPrototypeOf(Controls)).call(this));

	    _this.plugins = plugins || [];

	    /**
	     * @property {HTMLElement[]} elements
	     */
	    _this.elements = [];

	    /**
	     * @property {function} removeTabIndexForAll
	     */
	    _this.removeTabIndexForAll = (0, _functional.forEach)((0, _elements.removeAttribute)('tabindex'));
	    /**
	     * @property {function} setTabIndexZero
	     */
	    _this.setTabIndexZero = (0, _elements.setAttribute)('tabindex', '0');

	    // move tabindex to next element
	    _this.on('nextElement', _this.nextElement, _this);

	    // move tabindex to previous element
	    _this.on('previousElement', _this.previousElement, _this);

	    // init plugins
	    _this.initPlugins();
	    return _this;
	  }

	  /**
	   * Add controls to an element
	   *
	   * @param {HTMLElement} el
	   *
	   * @public
	   */


	  _createClass(Controls, [{
	    key: 'addElement',
	    value: function addElement(el) {
	      this.elements.push(el);

	      this.firesEvent('addElement', el);

	      if (this.elements.length === 1) {
	        // if first
	        this.setTabbable(el);
	      }
	    }
	  }, {
	    key: 'firesEvent',


	    /**
	     * Fire event
	     *
	     * @param {string} type
	     * @param {HTMLElement} el
	     *
	     * @public
	     */
	    value: function firesEvent(type, el) {
	      var index = this.elements.indexOf(el);

	      this.fire(type, {
	        element: el,
	        index: index,
	        elements: this.elements,
	        oldElement: this.tabbableElement
	      });
	    }

	    /**
	     * Sets tabindex on an element, remove it from all others
	     *
	     * @param {number} index
	     *
	     * @private
	     */

	  }, {
	    key: 'nextElement',
	    value: function nextElement(_ref) {
	      var index = _ref.index;

	      var isLastElement = index === this.elements.length - 1;
	      var nextEl = this.elements[isLastElement ? 0 : index + 1];

	      this.setTabbable(nextEl);
	      nextEl.focus();
	    }

	    /**
	     * Sets tabindex on an element, remove it from all others
	     *
	     * @param {number} index
	     *
	     * @private
	     */

	  }, {
	    key: 'previousElement',
	    value: function previousElement(_ref2) {
	      var index = _ref2.index;

	      var isFirstElement = index === 0;
	      var prevEl = this.elements[isFirstElement ? this.elements.length - 1 : index - 1];

	      this.setTabbable(prevEl);
	      prevEl.focus();
	    }

	    /**
	     * Sets tabindex on an element, remove it from all others
	     *
	     * @param {HTMLElement} el
	     * @private
	     */

	  }, {
	    key: 'setTabbable',
	    value: function setTabbable(el) {
	      this.removeTabIndexForAll(this.elements);
	      this.setTabIndexZero(el);
	      this.tabbableElement = el;
	    }

	    /**
	     * Initializes the plugins
	     *
	     * @private
	     */

	  }, {
	    key: 'initPlugins',
	    value: function initPlugins() {
	      this.plugins.forEach(function (plugin) {
	        if (plugin.init !== undefined) {
	          plugin.init(this);
	        }
	      }, this);
	    }
	  }]);

	  return Controls;
	}(_events2.default);

	exports.default = Controls;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.attributeEquals = exports.hasAttribute = exports.removeAttribute = exports.setAttribute = exports.getAttribute = undefined;

	var _functional = __webpack_require__(3);

	/**
	 * Get an attribute value from element
	 *
	 * @param {string} name
	 * @param {HTMLElement} el
	 *
	 * @function
	 * @return {string}
	 */
	var getAttribute = exports.getAttribute = (0, _functional.curry)(function (name, el) {
	  return el.getAttribute(name);
	});

	/**
	 * Set an attribute on a html element
	 *
	 * @param {string} name
	 * @param {string} value
	 * @param {HTMLElement} el
	 *
	 * @function
	 */
	var setAttribute = exports.setAttribute = (0, _functional.curry)(function (name, value, el) {
	  el.setAttribute(name, value);
	});

	/**
	 * Remove attribute from html element
	 *
	 * @param {string} name
	 * @param {HTMLElement} el
	 *
	 * @function
	 */
	var removeAttribute = exports.removeAttribute = (0, _functional.curry)(function (name, el) {
	  el.removeAttribute(name);
	});

	/**
	 * Check if element has an attribute
	 *
	 * @param {string} name
	 * @param {HTMLElement} el
	 *
	 * @function
	 * @return {boolean}
	 */
	var hasAttribute = exports.hasAttribute = (0, _functional.curry)(function (name, el) {
	  return el.hasAttribute(name);
	});

	/**
	 * Check if element has an attribute that equals
	 *
	 * @param {string} name
	 * @param {string} value
	 * @param {HTMLElement} el
	 *
	 * @function
	 * @return {boolean}
	 */
	var attributeEquals = exports.attributeEquals = (0, _functional.curry)(function (name, value, el) {
	  return el.getAttribute(name) === value;
	});

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Returns a curried version of a function
	 *
	 * @param {function} fn
	 *
	 * @public
	 *
	 * @return {function}
	 */
	var curry = exports.curry = function curry(fn) {
	  var arity = fn.length;

	  return function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    var firstArgs = args.length;
	    if (firstArgs >= arity) {
	      return fn.apply(undefined, args);
	    } else {
	      return function () {
	        for (var _len2 = arguments.length, secondArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	          secondArgs[_key2] = arguments[_key2];
	        }

	        return fn.apply(undefined, [].concat(args, secondArgs));
	      };
	    }
	  };
	};

	/**
	 * Applies a function to each element in an array
	 *
	 * @param {function} fn
	 * @param {Array} arr
	 *
	 * @function
	 * @public
	 *
	 * @return {function}
	 */
	var forEach = exports.forEach = curry(function (fn, arr) {
	  arr.forEach(fn);
	});

	/**
	 * Maps a function to an array
	 *
	 * @param {function} fn
	 * @param {Array} arr
	 *
	 * @function
	 * @public
	 *
	 * @return {function}
	 */
	var map = exports.map = curry(function (fn, arr) {
	  return arr.map(fn);
	});

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Events = function () {
	  function Events() {
	    _classCallCheck(this, Events);

	    /**
	     * @type {object}
	     * @private
	     */
	    this.listeners = {};
	  }

	  /**
	   * Listen to event
	   *
	   * @param {string} type
	   * @param {function} listener
	   * @param {object} [scope]
	   */


	  _createClass(Events, [{
	    key: 'on',
	    value: function on(type, listener, scope) {
	      /**
	       * @typedef {object} Trigger
	       * @property {function} listener
	       * @property {object} scope
	       */
	      var trigger = {
	        'listener': listener,
	        'scope': scope
	      };

	      this.listeners[type] = this.listeners[type] || [];
	      this.listeners[type].push(trigger);
	    }

	    /**
	     * Fire event. If any of the listeners returns false, return false
	     *
	     * @param {string} type
	     * @param {object} event
	     *
	     * @return {boolean}
	     */

	  }, {
	    key: 'fire',
	    value: function fire(type, event) {
	      var triggers = this.listeners[type] || [];

	      return triggers.every(function (trigger) {
	        return trigger.listener.call(trigger.scope || this, event) !== false;
	      });
	    }
	  }]);

	  return Events;
	}();

	exports.default = Events;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * @class
	 * @classdesc Keyboard navigation for accessibility support
	 */
	var Keyboard = function () {
	  function Keyboard() {
	    _classCallCheck(this, Keyboard);

	    /**
	     * @property {boolean} selectability
	     */
	    this.selectability = true;
	  }

	  /**
	   * Inits this class
	   *
	   * @param {Controls} controls
	   */


	  _createClass(Keyboard, [{
	    key: 'init',
	    value: function init(controls) {
	      /**
	       * @type {Controls}
	       */
	      this.controls = controls;
	      this.controls.on('addElement', this.listenForKeyDown, this);
	    }
	  }, {
	    key: 'listenForKeyDown',


	    /**
	     * Listens for a keyboard press when element is focused
	     *
	     * @param {HTMLElement} element
	     * @private
	     */
	    value: function listenForKeyDown(_ref) {
	      var element = _ref.element;

	      element.addEventListener('keydown', this.handleKeyDown.bind(this));
	    }
	  }, {
	    key: 'handleKeyDown',


	    /**
	     * Handles key down
	     *
	     * @param {KeyboardEvent} event Keyboard event
	     * @private
	     */
	    value: function handleKeyDown(event) {
	      switch (event.which) {
	        case 13: // Enter
	        case 32:
	          // Space
	          this.select(event.target);
	          event.preventDefault();
	          break;

	        case 37: // Left Arrow
	        case 38:
	          // Up Arrow
	          this.previousElement(event.target);
	          event.preventDefault();
	          break;
	        case 39: // Right Arrow
	        case 40:
	          // Down Arrow
	          this.nextElement(event.target);
	          event.preventDefault();
	          break;
	      }
	    }
	  }, {
	    key: 'previousElement',


	    /**
	     * Fires the previous element event
	     *
	     * @param {HTMLElement|EventTarget} el
	     * @fires Controls#previousElement
	     */
	    value: function previousElement(el) {
	      this.controls.firesEvent('previousElement', el);
	    }
	  }, {
	    key: 'nextElement',


	    /**
	     * Fire the next element event
	     *
	     * @param {HTMLElement|EventTarget} el
	     * @fires Controls#nextElement
	     */
	    value: function nextElement(el) {
	      this.controls.firesEvent('nextElement', el);
	    }
	  }, {
	    key: 'select',


	    /**
	     * Fires the select event
	     *
	     * @param {EventTarget|HTMLElement} el
	     * @fires Controls#select
	     */
	    value: function select(el) {
	      if (this.selectability) {
	        this.controls.firesEvent('select', el);
	      }
	    }
	  }, {
	    key: 'disableSelectability',


	    /**
	     * Disable possibility to select a word trough click and space or enter
	     *
	     * @public
	     */
	    value: function disableSelectability() {
	      this.selectability = false;
	    }
	  }, {
	    key: 'enableSelectability',


	    /**
	     * Enable possibility to select a word trough click and space or enter
	     *
	     * @public
	     */
	    value: function enableSelectability() {
	      this.selectability = true;
	    }
	  }]);

	  return Keyboard;
	}();

	exports.default = Keyboard;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _elements = __webpack_require__(2);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Drag = function () {
	  function Drag() {
	    _classCallCheck(this, Drag);
	  }

	  _createClass(Drag, [{
	    key: 'init',

	    /**
	     * Inits this class
	     *
	     * @param {Controls} controls
	     */
	    value: function init(controls) {
	      /**
	       * @type {Controls}
	       */
	      this.controls = controls;
	      /**
	       * @property {function} grabElement
	       */
	      this.grabElement = (0, _elements.setAttribute)('aria-grabbed', 'true');
	      /**
	       * @property {function} unGrabElement
	       */
	      this.unGrabElement = (0, _elements.setAttribute)('aria-grabbed', 'false');

	      // handle add element event
	      this.controls.on('addElement', this.addElement, this);

	      // handle select event
	      this.controls.on('select', this.select, this);
	    }
	  }, {
	    key: 'addElement',


	    /**
	     * Marks element as grabbable (but not grabbed)
	     *
	     * @param element
	     */
	    value: function addElement(_ref) {
	      var element = _ref.element;

	      this.unGrabElement(element);
	    }

	    /**
	     * Handle grabbing objects
	     *
	     * @param {HTMLElement} element
	     * @param {HTMLElement} oldElement
	     */

	  }, {
	    key: 'select',
	    value: function select(_ref2) {
	      var element = _ref2.element,
	          oldElement = _ref2.oldElement;

	      var grabbed = element.getAttribute('aria-grabbed') === 'true';
	      element.setAttribute('aria-grabbed', grabbed ? 'false' : 'true');

	      /*
	      console.log('drag', element, oldElement);
	       // ungrabs the currently grabbed element
	      this.unGrabElement(oldElement);
	       // don't reselect same element
	      if(element !== oldElement){
	        console.log('do grab');
	        this.grabElement(element);
	      }*/
	    }
	  }]);

	  return Drag;
	}();

	exports.default = Drag;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _elements = __webpack_require__(2);

	var _functional = __webpack_require__(3);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Drop = function () {
	  function Drop() {
	    _classCallCheck(this, Drop);
	  }

	  _createClass(Drop, [{
	    key: 'init',

	    /**
	     * Inits this class
	     *
	     * @param {Controls} controls
	     */
	    value: function init(controls) {
	      /**
	       * @type {Controls}
	       */
	      this.controls = controls;
	      /**
	       * @property {function} setDropEffectNone
	       */
	      this.setDropEffectNone = (0, _elements.setAttribute)('aria-dropeffect', Drop.DropEffects.NONE);
	      /**
	       * @property {function} setAriaDropEffectForAll
	       */
	      this.setAriaDropEffectForAll = (0, _functional.curry)(function (dropEffect, _ref) {
	        var elements = _ref.elements;

	        (0, _functional.forEach)((0, _elements.setAttribute)('aria-dropeffect', dropEffect), elements);
	      });

	      // handle add element event
	      this.controls.on('addElement', this.addElement, this);

	      // handle remove drop effect when selected
	      this.controls.on('select', this.setAriaDropEffectForAll(Drop.DropEffects.NONE), this);
	    }
	  }, {
	    key: 'addElement',


	    /**
	     * Sets element to be droppable
	     *
	     * @param {HTMLElement} element
	     */
	    value: function addElement(_ref2) {
	      var element = _ref2.element;

	      this.setDropEffectNone(element);
	    }
	  }]);

	  return Drop;
	}();

	/**
	 * Enum for ARIA drop effects
	 * @readonly
	 * @enum {string}
	 */


	exports.default = Drop;
	Drop.DropEffects = {
	  NONE: 'none',
	  MOVE: 'move'
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _elements = __webpack_require__(2);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Choice = function () {
	  function Choice() {
	    _classCallCheck(this, Choice);

	    /**
	     * @type {function}
	     * @param {HTMLElement} el
	     */
	    this.removeAriaSelected = (0, _elements.removeAttribute)('aria-selected');
	    /**
	     * @type {function}
	     * @param {HTMLElement} el
	     */
	    this.addAriaSelected = (0, _elements.setAttribute)('aria-selected', 'true');
	  }

	  /**
	   * Inits this class
	   *
	   * @param {Controls} controls
	   */


	  _createClass(Choice, [{
	    key: 'init',
	    value: function init(controls) {
	      /**
	       * @type {Controls}
	       */
	      this.controls = controls;
	      this.controls.on('select', this.select, this);
	    }
	  }, {
	    key: 'select',


	    /**
	     * Toggles aria-selected on element
	     *
	     * @param {HTMLElement} element
	     * @param {HTMLElement} element
	     */
	    value: function select(_ref) {
	      var element = _ref.element,
	          oldElement = _ref.oldElement;

	      console.log('select', element, oldElement);

	      if (element === oldElement) {
	        this.removeAriaSelected(element);
	      } else {
	        this.addAriaSelected(element);
	      }
	    }
	  }]);

	  return Choice;
	}();

	exports.default = Choice;

/***/ }
/******/ ]); 