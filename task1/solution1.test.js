const assert = require('assert');
const {
  createObject, processDataString, addOverallPercentage, sortByKeyDESC, getMaxByKey,
} = require('./solution1');

const testCreateObject = () => {
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
};

const testProcessDataString = () => {
  const dataString = `city,population,area,density,country
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

  const result = processDataString({ dataString });
  assert.deepStrictEqual(result, expected, 'processDataString should correctly parse CSV data into objects');
  console.log('testProcessDataString: PASSED');
};

const testGetMaxByKey = () => {
  const objects = [
    { density: 100 },
    { density: 200 },
    { density: 150 },
  ];

  const expected = 200;
  const result = getMaxByKey({ objects, key: 'density' });
  assert.strictEqual(result, expected, 'getMaxByKey should return the maximum value for a given key');
  console.log('testGetMaxByKey: PASSED');
};

const testAddOverallPercentage = () => {
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
};

const testSortByKeyDESC = () => {
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

  const result = sortByKeyDESC({ arr, key: 'density' });
  assert.deepStrictEqual(result, expected, 'sortByKeyDESC should sort array in descending order by key');
  console.log('testSortByKeyDESC: PASSED');
};

const runTests = () => {
  console.log('Running Tests...\n');
  testCreateObject();
  testProcessDataString();
  testGetMaxByKey();
  testAddOverallPercentage();
  testSortByKeyDESC();
  console.log('\nAll Tests Completed.');
};

runTests();
