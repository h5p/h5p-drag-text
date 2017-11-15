import test from 'ava';

import { lex } from '../src/scripts/parse-text';

test('Parser should allow null', t => {
  const solution = lex('*Lorem null*');
  t.deepEqual(solution, {
    correctFeedback: null,
    incorrectFeedback: null,
    text: "Lorem null",
    tip: null
  });
});

test('Parser should allow undefined', t => {
  const solution = lex('*Lorem undefined*');
  t.deepEqual(solution, {
    correctFeedback: null,
    incorrectFeedback: null,
    text: "Lorem undefined",
    tip: null
  });
});

test('Parser should recognize a tip', t => {
  const solution = lex('*Lorem ipsum :tip*');
  t.deepEqual(solution, {
    correctFeedback: null,
    incorrectFeedback: null,
    text: "Lorem ipsum",
    tip: "tip"
  });
});

test('Parser should recognize correct feedback', t => {
  const solution = lex('*Lorem ipsum \\+Good job!*');
  t.deepEqual(solution, {
    correctFeedback: 'Good job!',
    incorrectFeedback: null,
    text: "Lorem ipsum",
    tip: null
  });
});

test('Parser should recognize incorrect feedback', t => {
  const solution = lex('*Lorem ipsum \\-Too bad!*');
  t.deepEqual(solution, {
    correctFeedback: null,
    incorrectFeedback: 'Too bad!',
    text: "Lorem ipsum",
    tip: null
  });
});

test('Parser should recognize correct and incorrect feedback', t => {
  const solution = lex('*Lorem ipsum \\+Good job! \\-Too bad!*');
  t.deepEqual(solution, {
    correctFeedback: 'Good job!',
    incorrectFeedback: 'Too bad!',
    text: "Lorem ipsum",
    tip: null
  });
});

test('Parser should recognize tip, correct and incorrect feedback', t => {
  const solution = lex('*Lorem ipsum :tip \\+Good job! \\-Too bad!*');
  t.deepEqual(solution, {
    correctFeedback: 'Good job!',
    incorrectFeedback: 'Too bad!',
    text: "Lorem ipsum",
    tip: 'tip'
  });
});

test('Parser should recognize tip, correct and incorrect feedback in different orders', t => {
  const solution = lex('*Lorem ipsum \\-Too bad! \\+Good job!  :tip *');
  t.deepEqual(solution, {
    correctFeedback: 'Good job!',
    incorrectFeedback: 'Too bad!',
    text: "Lorem ipsum",
    tip: 'tip'
  });
});

test('Parser should work with the example given in the semantics', t => {
  const solution = lex('*interactive\\+Correct, H5P is interactive \\-Incorrect match!*');
  t.deepEqual(solution, {
    correctFeedback: 'Correct, H5P is interactive',
    incorrectFeedback: 'Incorrect match!',
    text: "interactive",
    tip: null
  });
});
