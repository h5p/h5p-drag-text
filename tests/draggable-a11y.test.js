import test from 'ava';

const Module = require('module');

global.H5P = {
  EventDispatcher: function () {},
  Question: function () {},
  jQuery: (element) => ({ 0: element, on: () => {} }),
};

const { default: Draggable } = require('../src/scripts/draggable.js');

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.startsWith('h5p-lib-controls/')) {
    return { __esModule: true, default: function () {} };
  }
  return originalLoad.call(this, request, parent, isMain);
};

let DragText;
try {
  ({ default: DragText } = require('../src/scripts/drag-text.js'));
}
finally {
  Module._load = originalLoad;
}

test('Should reapply the position label after the draggable content is replaced', (t) => {
  const element = {
    hiddenLabel: { innerHTML: '' },
    querySelector: function (selector) {
      t.is(selector, '.h5p-hidden-read');
      return this.hiddenLabel;
    },
    setContent: function ({ label }) {
      this.label = label;
      this.hiddenLabel = { innerHTML: '' };
    },
  };
  const draggable = new Draggable('orange', element, 1);

  draggable.updateAriaLabel('2 of 4 draggables.');
  const previousLabel = element.hiddenLabel;

  draggable.removeShortFormat();
  draggable.updateAriaLabel('2 of 4 draggables.');

  t.is(element.label, 'orange');
  t.not(element.hiddenLabel, previousLabel);
  t.is(element.hiddenLabel.innerHTML, '2 of 4 draggables.');
});

test.serial('Should preserve the position label when changing a draggable\'s text', (t) => {
  const pendingTimers = [];
  const previousWindow = global.window;
  const previousTooltip = H5P.Tooltip;
  global.window = {
    setTimeout(callback) {
      pendingTimers.push(callback);
    },
  };
  H5P.Tooltip = () => ({ remove: () => {} });
  t.teardown(() => {
    global.window = previousWindow;
    H5P.Tooltip = previousTooltip;
  });

  const text = 'A draggable with a very long answer';
  const element = {
    hiddenLabel: { innerHTML: '' },
    querySelector(selector) {
      return selector === 'span' ? { clientWidth: 0 } : this.hiddenLabel;
    },
    setContent({ label }) {
      this.label = label;
      this.hiddenLabel = { innerHTML: '' };
    },
  };
  const draggable = new Draggable(text, element, 0);
  const runTimers = () => {
    const callbacks = pendingTimers.splice(0);
    callbacks.forEach((callback) => callback());
  };

  draggable.updateAriaLabel('1 of 3 draggables.');
  draggable.setShortFormat();
  runTimers();
  t.is(element.hiddenLabel.innerHTML, '1 of 3 draggables.');

  draggable.removeShortFormat();
  t.is(element.label, text);
  t.is(element.hiddenLabel.innerHTML, '1 of 3 draggables.');
});

test('Should keep unique numbers when replacing and reverting placed words', (t) => {
  const draggables = ['A', 'B', 'C', 'D'].map((name, index) => {
    const element = { name };
    return {
      $draggable: { get: () => element },
      getElement: () => element,
      getIndex: () => index,
      updateAriaLabel(label) { this.label = label; },
      removeFromZone: () => {},
    };
  });
  const [a, b, c, d] = draggables;
  const list = [b.getElement(), c.getElement(), d.getElement()];
  const dragText = Object.create(DragText.prototype);
  dragText.draggables = draggables;
  dragText.$draggables = [{ children: list }];
  dragText.params = {
    ariaDraggableIndex: '@index of @count.',
    behaviour: { instantFeedback: false },
  };
  dragText.trigger = () => {};
  draggables.forEach((draggable) => dragText.setDraggableAriaLabel(draggable));

  a.revertDraggableTo = (container) => {
    t.is(container, dragText.$draggables);
    list.unshift(a.getElement());
  };
  b.appendDraggableTo = () => {
    list.splice(list.indexOf(b.getElement()), 1);
  };

  const target = {};
  const droppable = {
    appendInsideDroppableTo(container) {
      a.revertDraggableTo(container);
      return a;
    },
    getElement: () => target,
    getDropzone: () => target,
    setDraggable: () => {},
  };

  dragText.drop(b, droppable);

  t.deepEqual(list, [a.getElement(), c.getElement(), d.getElement()]);
  t.deepEqual(draggables.map((draggable) => draggable.label), [
    '1 of 4.', '2 of 4.', '3 of 4.', '4 of 4.',
  ]);

  b.removeFromZone = () => droppable;
  b.revertDraggableTo = (container) => {
    t.is(container, dragText.$draggables);
    list.unshift(b.getElement());
  };
  dragText.revert(b);

  t.deepEqual(list, [b.getElement(), a.getElement(), c.getElement(), d.getElement()]);
  t.deepEqual(draggables.map((draggable) => draggable.label), [
    '1 of 4.', '2 of 4.', '3 of 4.', '4 of 4.',
  ]);
});
