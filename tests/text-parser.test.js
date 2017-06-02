import test from 'ava';
import TextParser from '../src/scripts/text-parser';

test.beforeEach(t => {
  t.context.textParser = new TextParser();
});

test('Parser should parse middle', t => {
  const arr = t.context.textParser.parse('first *second* third');
  t.deepEqual(arr, ['first ', '*second*', ' third']);
});

test('Parser should parse first and last', t => {
  const arr = t.context.textParser.parse('*first* second *third*');
  t.deepEqual(arr, ['*first*', ' second ', '*third*']);
});

test('Parser should allow black space in draggables', t => {
  const arr = t.context.textParser.parse('*first second* third');
  t.deepEqual(arr, ['*first second*', ' third']);
});