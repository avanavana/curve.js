import { isValidPointArgs, isNotValidPointArgs } from '../validation.js';
import { collectArgs } from '../utils.js';

describe('Arguments of new Point() constructor:', () => {
  test('A single argument of type "{ x: number | string, y: number | string }" (where string values are able to be coerced to numbers) should be valid as constructor arguments for class "Point" (isValidPointArgs should return true and isNotValidPointArgs should return false).', () => {
	expect(collectArgs(isValidPointArgs, { x: 1, y: 2 })).toBe(true);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: 2 })).toBe(false);
	expect(collectArgs(isValidPointArgs, { x: '1', y: 2 })).toBe(true);
	expect(collectArgs(isNotValidPointArgs, { x: '1', y: 2 })).toBe(false);
	expect(collectArgs(isValidPointArgs, { x: 1, y: '2' })).toBe(true);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: '2' })).toBe(false);
	expect(collectArgs(isValidPointArgs, { x: '1', y: '2' })).toBe(true);
	expect(collectArgs(isNotValidPointArgs, { x: '1', y: '2' })).toBe(false);
	expect(collectArgs(isValidPointArgs, { x: 'test', y: 2 })).toBe(false);
    expect(collectArgs(isNotValidPointArgs, { x: 'test', y: 2 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1, y: 'test' })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: 'test' })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 'test', y: 'test' })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 'test', y: 'test' })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1, b: 2 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1, b: 2 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { a: 1, y: 2 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { a: 1, y: 2 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { a: 1, b: 2 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { a: 1, b: 2 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: [ 1 ], y: 2 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: [ 1 ], y: 2 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1, y: [ 2 ] })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: [ 2 ] })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: [ 1 ], y: [ 2 ] })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: [ 1 ], y: [ 2 ] })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: { x: 1 }, y: 2 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: { x: 1 }, y: 2 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1, y: { y: 2 }})).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: { y: 2 }})).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: { x: 1 }, y: { y: 2 }})).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: { x: 1 }, y: { y: 2 }})).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1, y: null })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: null })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: null, y: 2 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: null, y: 2 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: null, y: null })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: null, y: null })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1, y: undefined })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: undefined })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: undefined, y: 2 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: undefined, y: 2 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: undefined, y: undefined })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: undefined, y: undefined })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { y: 2 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { y: 2 })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: '1' })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: '1' })).toBe(true);
	expect(collectArgs(isValidPointArgs, { y: '2' })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { y: '2' })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: null, y: null })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: null, y: null })).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1, y: 2, z: 3 })).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: 2, z: 3 })).toBe(true);
  });
	
  test('A single argument of type "[ number | string, number | string ]" (where string values are able to be coerced as numbers) should be valid as constructor arguments for class "Point" (isValidPointArgs should return true and isNotValidPointArgs should return false).', () => {
    expect(collectArgs(isValidPointArgs, [ 1, 2 ])).toBe(true);
    expect(collectArgs(isNotValidPointArgs, [ 1, 2 ])).toBe(false);
    expect(collectArgs(isValidPointArgs, [ 1, 'test' ])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [ 1, 'test' ])).toBe(true);
    expect(collectArgs(isValidPointArgs, [ 'test', 2 ])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [ 'test', 2 ])).toBe(true);
	expect(collectArgs(isValidPointArgs, [ 'test', 'test' ])).toBe(false);
	expect(collectArgs(isNotValidPointArgs, [ 'test', 'test' ])).toBe(true);
	expect(collectArgs(isValidPointArgs, [ 1, '2' ])).toBe(true);
	expect(collectArgs(isNotValidPointArgs, [ 1, '2' ])).toBe(false);
	expect(collectArgs(isValidPointArgs, [ '1', 2 ])).toBe(true);
	expect(collectArgs(isNotValidPointArgs, [ '1', 2 ])).toBe(false);
	expect(collectArgs(isValidPointArgs, [ '1', '2' ])).toBe(true);
	expect(collectArgs(isNotValidPointArgs, [ '1', '2' ])).toBe(false);
    expect(collectArgs(isValidPointArgs, [ 1 ])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [ 1 ])).toBe(true);
	expect(collectArgs(isValidPointArgs, [ '1' ])).toBe(false);
	expect(collectArgs(isNotValidPointArgs, [ '1' ])).toBe(true);
    expect(collectArgs(isValidPointArgs, [])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [])).toBe(true);
    expect(collectArgs(isValidPointArgs, [ null, null ])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [ null, null ])).toBe(true);
    expect(collectArgs(isValidPointArgs, [ null ])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [ null ])).toBe(true);
    expect(collectArgs(isValidPointArgs, [ undefined ])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [ undefined ])).toBe(true);
    expect(collectArgs(isValidPointArgs, [ undefined, undefined ])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [ undefined, undefined ])).toBe(true);
  });
	
  test('Exactly two arguments of type "number" or "string" (where string values are able to be coerced as numbers) should be valid as constructor arguments for class "Point" (isValidPointArgs should return true and isNotValidPointArgs should return false).', () => {
    expect(collectArgs(isValidPointArgs, 1, 2)).toBe(true);
    expect(collectArgs(isNotValidPointArgs, 1, 2)).toBe(false);
    expect(collectArgs(isValidPointArgs, null, 2)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, null, 2)).toBe(true);
    expect(collectArgs(isValidPointArgs, 1, null)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 1, null)).toBe(true);
    expect(collectArgs(isValidPointArgs, undefined, 2)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, undefined, 2)).toBe(true);
    expect(collectArgs(isValidPointArgs, 1, undefined)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 1, undefined)).toBe(true);
    expect(collectArgs(isValidPointArgs, 1, 'test')).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 1, 'test')).toBe(true);
    expect(collectArgs(isValidPointArgs, 'test', 2)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 'test', 2)).toBe(true);
	expect(collectArgs(isValidPointArgs, 'test', 'test')).toBe(false);
	expect(collectArgs(isNotValidPointArgs, 'test', 'test')).toBe(true);
	expect(collectArgs(isValidPointArgs, 1, '2')).toBe(true);
	expect(collectArgs(isNotValidPointArgs, 1, '2')).toBe(false);
	expect(collectArgs(isValidPointArgs, '1', 2)).toBe(true);
	expect(collectArgs(isNotValidPointArgs, '1', 2)).toBe(false);
	expect(collectArgs(isValidPointArgs, '1', '2')).toBe(true);
	expect(collectArgs(isNotValidPointArgs, '1', '2')).toBe(false);
    expect(collectArgs(isValidPointArgs, null)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, null)).toBe(true);
    expect(collectArgs(isValidPointArgs, undefined)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, undefined)).toBe(true);
    expect(collectArgs(isValidPointArgs, null, null)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, null, null)).toBe(true);
    expect(collectArgs(isValidPointArgs, undefined, undefined)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, undefined, undefined)).toBe(true);
    expect(collectArgs(isValidPointArgs, [ 1, 2 ], 1)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [ 1, 2 ], 1)).toBe(true);
    expect(collectArgs(isValidPointArgs, 1, [ 1, 2 ])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 1, [ 1, 2 ])).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1, y: 2 }, 1)).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: 2 }, 1)).toBe(true);
    expect(collectArgs(isValidPointArgs, 1, { x: 1, y: 2 })).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 1, { x: 1, y: 2 })).toBe(true);
    expect(collectArgs(isValidPointArgs, [ 1, 2 ], { x: 1, y: 2 })).toBe(false);
    expect(collectArgs(isNotValidPointArgs, [ 1, 2 ], { x: 1, y: 2 })).toBe(true);
    expect(collectArgs(isValidPointArgs, { x: 1, y: 2 }, [ 1, 2 ])).toBe(false);
    expect(collectArgs(isNotValidPointArgs, { x: 1, y: 2 }, [ 1, 2 ])).toBe(true);
    expect(collectArgs(isValidPointArgs, { x: 1, y: 2 }, 'test')).toBe(false);
    expect(collectArgs(isNotValidPointArgs, { x: 1, y: 2 }, 'test')).toBe(true);
    expect(collectArgs(isValidPointArgs, 'test', { x: 1, y: 2 })).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 'test', { x: 1, y: 2 })).toBe(true);
  });
  
  test('More than two arguments of any type should always be invalid as constructor arguments for class "Point" (isValidPointArgs should return false and isNotValidPointArgs should return true).', () => {
    expect(collectArgs(isValidPointArgs, 1, 2, 3)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 1, 2, 3)).toBe(true);
    expect(collectArgs(isValidPointArgs, null, 1, 2)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, null, 1, 2)).toBe(true);
    expect(collectArgs(isValidPointArgs, undefined, 1, 2)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, undefined, 1, 2)).toBe(true);
    expect(collectArgs(isValidPointArgs, 1, 2, null)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 1, 2, null)).toBe(true);
    expect(collectArgs(isValidPointArgs, 1, 2, undefined)).toBe(false);
    expect(collectArgs(isNotValidPointArgs, 1, 2, undefined)).toBe(true);
	expect(collectArgs(isValidPointArgs, '1', '2', '3')).toBe(false);
	expect(collectArgs(isNotValidPointArgs, '1', '2', '3')).toBe(true);
	expect(collectArgs(isValidPointArgs, 1, 2, '3')).toBe(false);
	expect(collectArgs(isNotValidPointArgs, 1, 2, '3')).toBe(true);
	expect(collectArgs(isValidPointArgs, null, 2, 3)).toBe(false);
	expect(collectArgs(isNotValidPointArgs, null, 2, 3)).toBe(true);
	expect(collectArgs(isValidPointArgs, undefined, 2, 3)).toBe(false);
	expect(collectArgs(isNotValidPointArgs, undefined, 2, 3)).toBe(true);
	expect(collectArgs(isValidPointArgs, [ 1 ], 2, 3)).toBe(false);
	expect(collectArgs(isNotValidPointArgs, [ 1 ], 2, 3)).toBe(true);
	expect(collectArgs(isValidPointArgs, [ 1 ], [ 2 ], 3)).toBe(false);
	expect(collectArgs(isNotValidPointArgs, [ 1 ], [ 2 ], 3)).toBe(true);
	expect(collectArgs(isValidPointArgs, [ 1 ], [ 2 ], [ 3 ])).toBe(false);
	expect(collectArgs(isNotValidPointArgs, [ 1 ], [ 2 ], [ 3 ])).toBe(true);
	expect(collectArgs(isValidPointArgs, [ 1 ], 2, [ 3 ])).toBe(false);
	expect(collectArgs(isNotValidPointArgs, [ 1 ], 2, [ 3 ])).toBe(true);
	expect(collectArgs(isValidPointArgs, 1, [ 2 ], [ 3 ])).toBe(false);
	expect(collectArgs(isNotValidPointArgs, 1, [ 2 ], [ 3 ])).toBe(true);
	expect(collectArgs(isValidPointArgs, 1, 2, [ 3 ])).toBe(false);
	expect(collectArgs(isNotValidPointArgs, 1, 2, [ 3 ])).toBe(true);
	expect(collectArgs(isValidPointArgs, 1, [ 2 ], 3)).toBe(false);
	expect(collectArgs(isNotValidPointArgs, 1, [ 2 ], 3)).toBe(true);
	expect(collectArgs(isValidPointArgs, { x: 1, y: 2 }, 2, 3)).toBe(false);
	expect(collectArgs(isNotValidPointArgs, { x: 1, y: 2 }, 2, 3)).toBe(true);
  });
});