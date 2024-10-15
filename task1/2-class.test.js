const assert = require('node:assert');
const { describe, it, before } = require('node:test');

const {
  CSVParser,
  CSVValidator,
  DataProcessor,
  Sorter,
  CSVController,
} = require('./2-class');

const validCSV = `city,population,area,density,country
Shanghai,24256800,6340,3826,China
Delhi,16787941,1484,11313,India`;

const invalidCSV = `city,population,area,density,country
Shanghai,24256800,6340,3826
Delhi,16787941,1484,11313,India`;

describe('CSVValidator', () => {
  it('should return true for valid CSV data', () => {
    const result = CSVValidator.validate(validCSV);
    assert.strictEqual(result, true);
  });

  it('should return false for invalid CSV data', () => {
    const result = CSVValidator.validate(invalidCSV);
    assert.strictEqual(result, false);
  });
});

describe('CSVParser', () => {
  let parser;

  before(() => {
    parser = new CSVParser(validCSV);
    parser.parse();
  });

  it('should parse keys correctly', () => {
    assert.deepStrictEqual(parser.keys, [
      'city',
      'population',
      'area',
      'density',
      'country',
    ]);
  });

  it('should parse rows correctly', () => {
    assert.deepStrictEqual(parser.rows, [
      ['Shanghai', '24256800', '6340', '3826', 'China'],
      ['Delhi', '16787941', '1484', '11313', 'India'],
    ]);
  });

  it('should convert rows to objects correctly', () => {
    const objects = parser.toObjects();
    assert.deepStrictEqual(objects, [
      {
        city: 'Shanghai',
        population: 24256800,
        area: 6340,
        density: 3826,
        country: 'China',
      },
      {
        city: 'Delhi',
        population: 16787941,
        area: 1484,
        density: 11313,
        country: 'India',
      },
    ]);
  });
});

describe('DataProcessor', () => {
  const processor = new DataProcessor();

  it('should add field correctly', () => {
    const objects = [
      { density: 1000 },
      { density: 2000 },
      { density: 3000 },
    ];
    const result = processor.addField(objects);
    assert.deepStrictEqual(result, [
      { density: 1000, densityPercentage: 33 },
      { density: 2000, densityPercentage: 67 },
      { density: 3000, densityPercentage: 100 },
    ]);
  });

  it('should remove index correctly', () => {
    const objects = [
      { city: 'A' },
      { city: 'B' },
      { city: 'C' },
    ];
    const result = processor.removeIndex(objects);

    assert.deepStrictEqual(result, [
      { city: 'A' },
      { city: 'B' },
    ]);
  });
});

describe('Sorter', () => {
  it('should sort array in descending order by default', () => {
    const sorter = new Sorter();
    const arr = [
      { value: 1 },
      { value: 3 },
      { value: 2 },
    ];
    const result = sorter.sortByKey(arr, 'value');
    assert.deepStrictEqual(result, [
      { value: 3 },
      { value: 2 },
      { value: 1 },
    ]);
  });

  it('should sort array in ascending order when specified', () => {
    const sorter = new Sorter('ASC');
    const arr = [
      { value: 3 },
      { value: 1 },
      { value: 2 },
    ];
    const result = sorter.sortByKey(arr, 'value');
    assert.deepStrictEqual(result, [
      { value: 1 },
      { value: 2 },
      { value: 3 },
    ]);
  });
});

describe('CSVController', () => {
  it('should execute without errors and process data correctly', () => {
    const controller = new CSVController(validCSV);
    const result = controller.execute();
    assert.ok(Array.isArray(result), 'Result should be an array');
    assert.strictEqual(result.length, 1, 'Result array should have length 1');
    const [firstEntry] = result;
    assert.strictEqual(firstEntry.city, 'Shanghai', 'First entry city should be Shanghai');
    assert.strictEqual(firstEntry.densityPercentage, 34, 'Density percentage should be 34');
    const containsDelhi = result.some((item) => item.city === 'Delhi');
    assert.strictEqual(containsDelhi, false, 'Delhi should be removed from the result');
  });

  it('should throw an Error when CSV is invalid', () => {
    const controller = new CSVController(invalidCSV);

    assert.throws(() => { controller.execute(); }, /Invalid CSV/);
  });
});
