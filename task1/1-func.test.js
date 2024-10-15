const assert = require('node:assert');
const { describe, it } = require('node:test');

const {
  createObject,
  processCSVToObjects,
  addOverallPercentage,
  getMaxByKey,
  sortByKey,
  isValidCSV,
  getKeysAndRows,
  adjustIndex,
  addFieldToObjects,
  removeObjectAtAdjustedIndex,
  compose,
} = require('./1-func');

describe('isValidCSV', () => {
  it('Valid CSV with header and rows, consistent columns', () => {
    const csv = 'col1,col2\nval1,val2\nval3,val4';
    const result = isValidCSV({ csv });
    assert.strictEqual(result, true);
  });

  it('Invalid CSV with only header', () => {
    const csv = 'col1,col2';
    const result = isValidCSV({ csv });
    assert.strictEqual(result, false);
  });

  it('Invalid CSV with inconsistent columns', () => {
    const csv = 'col1,col2\nval1,val2\nval3';
    const result = isValidCSV({ csv });
    assert.strictEqual(result, false);
  });

  it('Valid CSV with extra spaces', () => {
    const csv = 'col1, col2 \n val1, val2 \n val3, val4';
    const result = isValidCSV({ csv });
    assert.strictEqual(result, true);
  });
});

describe('createObject', () => {
  it('Converts numeric strings to numbers', () => {
    const keys = ['a', 'b'];
    const values = ['1', '2'];
    const expected = { a: 1, b: 2 };
    const result = createObject({ keys, values });
    assert.deepStrictEqual(result, expected);
  });

  it('Keeps non-numeric strings as strings', () => {
    const keys = ['a', 'b'];
    const values = ['x', '2'];
    const expected = { a: 'x', b: 2 };
    const result = createObject({ keys, values });
    assert.deepStrictEqual(result, expected);
  });

  it('Handles single key-value pair', () => {
    const keys = ['a'];
    const values = ['hello'];
    const expected = { a: 'hello' };
    const result = createObject({ keys, values });
    assert.deepStrictEqual(result, expected);
  });

  it('Handles empty arrays', () => {
    const keys = [];
    const values = [];
    const expected = {};
    const result = createObject({ keys, values });
    assert.deepStrictEqual(result, expected);
  });
});

describe('getKeysAndRows', () => {
  it('Parses CSV into keys and rows', () => {
    const csv = 'col1,col2\nval1,val2\nval3,val4';
    const expected = {
      keys: ['col1', 'col2'],
      rows: [['val1', 'val2'], ['val3', 'val4']],
    };
    const result = getKeysAndRows({ csv });
    assert.deepStrictEqual(result, expected);
  });

  it('Handles extra spaces', () => {
    const csv = ' col1 , col2 \n val1 , val2 \n val3 , val4 ';
    const expected = {
      keys: ['col1', 'col2'],
      rows: [['val1', 'val2'], ['val3', 'val4']],
    };
    const result = getKeysAndRows({ csv });
    assert.deepStrictEqual(result, expected);
  });
});

describe('processCSVToObjects', () => {
  it('Processes CSV into array of objects', () => {
    const csv = 'col1,col2\nval1,2\nval3,4';
    const expected = [
      { col1: 'val1', col2: 2 },
      { col1: 'val3', col2: 4 },
    ];
    const result = processCSVToObjects({ csv });
    assert.deepStrictEqual(result, expected);
  });

  it('Handles numeric and non-numeric values', () => {
    const csv = 'col1,col2\n1,2\n3,four';
    const expected = [
      { col1: 1, col2: 2 },
      { col1: 3, col2: 'four' },
    ];
    const result = processCSVToObjects({ csv });
    assert.deepStrictEqual(result, expected);
  });
});

describe('addOverallPercentage', () => {
  it('Adds percentage field to object', () => {
    const object = { value: 50 };
    const max = 100;
    const fieldToAdd = 'percentage';
    const fieldToProcess = 'value';
    const expected = { value: 50, percentage: 50 };
    const result = addOverallPercentage({
      object, max, fieldToAdd, fieldToProcess,
    });
    assert.deepStrictEqual(result, expected);
  });

  it('Rounds percentage', () => {
    const object = { value: 33 };
    const max = 100;
    const fieldToAdd = 'percentage';
    const fieldToProcess = 'value';
    const expected = { value: 33, percentage: 33 };
    const result = addOverallPercentage({
      object, max, fieldToAdd, fieldToProcess,
    });
    assert.deepStrictEqual(result, expected);
  });

  it('Handles zero max value (avoid division by zero)', () => {
    const object = { value: 50 };
    const max = 0;
    const fieldToAdd = 'percentage';
    const fieldToProcess = 'value';
    const expected = { value: 50, percentage: 0 };
    const result = addOverallPercentage({
      object, max, fieldToAdd, fieldToProcess,
    });
    assert.deepStrictEqual(result, expected);
  });
});

describe('getMaxByKey', () => {
  it('Finds max value for given key', () => {
    const objects = [{ a: 1 }, { a: 5 }, { a: 3 }];
    const key = 'a';
    const expected = 5;
    const result = getMaxByKey({ objects, key });
    assert.strictEqual(result, expected);
  });

  it('Handles missing keys (should return NaN)', () => {
    const objects = [{ a: 1 }, {}, { a: 3 }];
    const key = 'a';
    const result = getMaxByKey({ objects, key });
    assert.ok(Number.isNaN(result));
  });

  it('Handles empty array', () => {
    const objects = [];
    const key = 'a';
    const result = getMaxByKey({ objects, key });
    const expected = -Infinity;
    assert.strictEqual(result, expected);
  });
});

describe('sortByKey', () => {
  it('Sorts array in descending order by default', () => {
    const arr = [{ a: 1 }, { a: 3 }, { a: 2 }];
    const expected = [{ a: 3 }, { a: 2 }, { a: 1 }];
    const result = sortByKey({ arr, key: 'a' });
    assert.deepStrictEqual(result, expected);
  });

  it('Sorts array in ascending order when specified', () => {
    const arr = [{ a: 3 }, { a: 1 }, { a: 2 }];
    const expected = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const result = sortByKey({ arr, key: 'a', order: 'ASC' });
    assert.deepStrictEqual(result, expected);
  });

  it('Original array is not mutated', () => {
    const arr = [{ a: 1 }, { a: 2 }];
    const arrCopy = [...arr];
    const result = sortByKey({ arr, key: 'a' });
    assert.deepStrictEqual(arr, arrCopy);
    assert.notStrictEqual(arr, result);
  });
});

describe('adjustIndex', () => {
  it('Adjusts positive index within bounds', () => {
    const result = adjustIndex({ indexToRemove: 2, arrayLength: 5 });
    const expected = { adjustedIndex: 2, validIndex: true };
    assert.deepStrictEqual(result, expected);
  });

  it('Adjusts negative index within bounds', () => {
    const result = adjustIndex({ indexToRemove: -1, arrayLength: 5 });
    const expected = { adjustedIndex: 4, validIndex: true };
    assert.deepStrictEqual(result, expected);
  });

  it('Index out of bounds (positive)', () => {
    const result = adjustIndex({ indexToRemove: 5, arrayLength: 5 });
    const expected = { adjustedIndex: 5, validIndex: false };
    assert.deepStrictEqual(result, expected);
  });

  it('Index out of bounds (negative)', () => {
    const result = adjustIndex({ indexToRemove: -6, arrayLength: 5 });
    const expected = { adjustedIndex: -1, validIndex: false };
    assert.deepStrictEqual(result, expected);
  });

  it('Non-integer index', () => {
    const result = adjustIndex({ indexToRemove: 'abc', arrayLength: 5 });
    const expected = { adjustedIndex: 'abc', validIndex: false };
    assert.deepStrictEqual(result, expected);
  });
});

describe('addFieldToObjects', () => {
  it('Adds new field to objects', () => {
    const objects = [{ value: 50 }, { value: 100 }];
    const fieldToProcess = 'value';
    const fieldToAdd = 'percentage';
    const expected = [{ value: 50, percentage: 50 }, { value: 100, percentage: 100 }];
    const result = addFieldToObjects({ objects, fieldToProcess, fieldToAdd });
    assert.deepStrictEqual(result, expected);
  });

  it('Handles empty array', () => {
    const objects = [];
    const result = addFieldToObjects({ objects, fieldToProcess: 'value', fieldToAdd: 'percentage' });
    assert.deepStrictEqual(result, []);
  });

  it('Handles missing fieldToProcess in some objects', () => {
    const objects = [{ value: 50 }, {}];
    const fieldToProcess = 'value';
    const fieldToAdd = 'percentage';
    const result = addFieldToObjects({ objects, fieldToProcess, fieldToAdd });
    const expected = [{ value: 50, percentage: NaN }, { percentage: NaN }];
    assert.deepStrictEqual(result, expected);
  });
});

describe('removeObjectAtAdjustedIndex', () => {
  it('Removes object at positive index', () => {
    const objects = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const indexToRemove = 1;
    const expected = [{ a: 1 }, { a: 3 }];
    const result = removeObjectAtAdjustedIndex({ indexToRemove, objects });
    assert.deepStrictEqual(result, expected);
  });

  it('Removes object at negative index', () => {
    const objects = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const indexToRemove = -1;
    const expected = [{ a: 1 }, { a: 2 }];
    const result = removeObjectAtAdjustedIndex({ indexToRemove, objects });
    assert.deepStrictEqual(result, expected);
  });

  it('Index out of bounds (does not remove)', () => {
    const objects = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const indexToRemove = 5;
    const result = removeObjectAtAdjustedIndex({ indexToRemove, objects });
    assert.deepStrictEqual(result, objects);
  });

  it('Non-integer index (does not remove)', () => {
    const objects = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const indexToRemove = 'abc';
    const result = removeObjectAtAdjustedIndex({ indexToRemove, objects });
    assert.deepStrictEqual(result, objects);
  });
});

describe('compose', () => {
  it('Composes functions from left to right', () => {
    const add = (x) => x + 1;
    const double = (x) => x * 2;
    const composedFunction = compose(add, double);
    const result = composedFunction(5);
    assert.strictEqual(result, 12);
  });

  it('Handles empty functions list', () => {
    const composedFunction = compose();
    const result = composedFunction(5);
    assert.strictEqual(result, 5);
  });
});
