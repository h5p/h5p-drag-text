import test from 'ava';
import { parseText } from '../src/scripts/parse-text';


test('Parser should parse middle', t => {
  const arr = parseText('first *second* third');
  t.deepEqual(arr, ['first ', '*second*', ' third']);
});

test('Parser should parse first and last', t => {
  const arr = parseText('*first* second *third*');
  t.deepEqual(arr, ['*first*', ' second ', '*third*']);
});

test('Parser should allow same draggable multiple times', t => {
  const arr = parseText('*first* second *first* third');
  t.deepEqual(arr, ['*first*', ' second ', '*first*', ' third']);
});

test('Parser should allow black space in draggables', t => {
  const arr = parseText('*first second* third');
  t.deepEqual(arr, ['*first second*', ' third']);
});

test('Parser should allow draggables next to each other', t => {
  const arr = parseText('*first**second**third*');
  t.deepEqual(arr, ['*first*', '*second*', '*third*']);
});

test('Parser should allow reserved characters', t => {
  const arr = parseText('*first/1st* *second:tip* *third/3rd:tip*');
  t.deepEqual(arr, ['*first/1st*', ' ', '*second:tip*', ' ', '*third/3rd:tip*']);
});

test('Parser should allow empty string', t => {
  const arr = parseText('');
  t.deepEqual(arr, []);
});
