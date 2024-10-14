const assert = require('assert');
const {
  createObject, processCSVToObjects, addOverallPercentage, sortByKey, getMaxByKey, isValidCSV,
} = require('./solution1');

const testIsValidCSV = () => {
  try {
    // Valid CSV
    const validCSV1 = {
      csv: `name,age,city
John,30,New York
Jane,25,Los Angeles`,
    };
    assert.strictEqual(isValidCSV(validCSV1), true, 'Test Case 1 Failed');

    // Invalid CSV (row with different number of columns)
    const invalidCSV1 = {
      csv: `name,age,city
John,30
Jane,25,Los Angeles`,
    };
    assert.strictEqual(isValidCSV(invalidCSV1), false, 'Test Case 2 Failed');

    // Invalid CSV (empty CSV)
    const validCSV2 = { csv: '' };
    assert.strictEqual(isValidCSV(validCSV2), false, 'Test Case 3 Failed');

    // Invalid CSV (single row)
    const validCSV3 = { csv: 'name,age,city' };
    assert.strictEqual(isValidCSV(validCSV3), false, 'Test Case 4 Failed');

    // Invalid CSV (mismatched columns in one row)
    const invalidCSV2 = {
      csv: `name,age,city
John,30,New York
Jane,Los Angeles`,
    };
    assert.strictEqual(isValidCSV(invalidCSV2), false, 'Test Case 5 Failed');

    console.log('testIsValidCSV: PASSED');
  } catch (error) {
    console.log('testIsValidCSV: FAILED');
    console.error(error.message);
  }
};

const testCreateObject = () => {
  try {
    const keys = ['city', 'population', 'area', 'density', 'country'];
    const values = ['Tokyo', '13513734', '2191', '6168', 'Japan'];
    const expected = {
      city: 'Tokyo',
      population: 13513734,
      area: 2191,
      density: 6168,
      country: 'Japan',
    };

    const result = createObject({ keys, values });
    assert.deepStrictEqual(result, expected, 'createObject should correctly map keys to values and convert numbers');
    console.log('testCreateObject: PASSED');
  } catch (error) {
    console.log('processCSVToObjects: FAILED');
    console.error(error.message);
  }
};

const testProcessCSVToObjects = () => {
  try {
    const csv = `city,population,area,density,country
    Tokyo,13513734,2191,6168,Japan
    London,8673713,1572,5431,United Kingdom`;

    const expected = [
      {
        city: 'Tokyo',
        population: 13513734,
        area: 2191,
        density: 6168,
        country: 'Japan',
      },
      {
        city: 'London',
        population: 8673713,
        area: 1572,
        density: 5431,
        country: 'United Kingdom',
      },
    ];

    const result = processCSVToObjects({ csv });
    assert.deepStrictEqual(result, expected, 'processDataString should correctly parse CSV data into objects');
    console.log('processCSVToObjects: PASSED');
  } catch (error) {
    console.log('processCSVToObjects: FAILED');
    console.error(error.message);
  }
};

const testGetMaxByKey = () => {
  try {
    const objects = [
      { density: 100 },
      { density: 200 },
      { density: 150 },
    ];

    const expected = 200;
    const result = getMaxByKey({ objects, key: 'density' });
    assert.strictEqual(result, expected, 'getMaxByKey should return the maximum value for a given key');
    console.log('testGetMaxByKey: PASSED');
  } catch (error) {
    console.log('testGetMaxByKey: FAILED');
    console.error(error.message);
  }
};

const testAddOverallPercentage = () => {
  try {
    const object = { density: 150 };
    const max = 200;
    const fieldToAdd = 'densityPercentage';
    const fieldToProcess = 'density';

    const expected = {
      density: 150,
      densityPercentage: 75, // (150 / 200) * 100 = 75%
    };

    const result = addOverallPercentage({
      object, max, fieldToAdd, fieldToProcess,
    });
    assert.deepStrictEqual(result, expected, 'addOverallPercentage should correctly add the percentage field');
    console.log('testAddOverallPercentage: PASSED');
  } catch (error) {
    console.log('testAddOverallPercentage: FAILED');
    console.error(error.message);
  }
};

const testSortByKeyDESC = () => {
  try {
    const arr = [
      { city: 'CityA', density: 300 },
      { city: 'CityB', density: 500 },
      { city: 'CityC', density: 400 },
    ];

    const expected = [
      { city: 'CityB', density: 500 },
      { city: 'CityC', density: 400 },
      { city: 'CityA', density: 300 },
    ];

    const result = sortByKey({ arr, key: 'density', order: 'DESC' });
    assert.deepStrictEqual(result, expected, 'sortByKeyDESC should sort array in descending order by key');
    console.log('testSortByKeyDESC: PASSED');
  } catch (error) {
    console.log('testSortByKeyDESC: FAILED');
    console.error(error.message);
  }
};

const runTests = () => {
  console.log('Running Tests...\n');
  testIsValidCSV();
  testCreateObject();
  testProcessCSVToObjects();
  testGetMaxByKey();
  testAddOverallPercentage();
  testSortByKeyDESC();
  console.log('\nAll Tests Completed.');
};

runTests();
