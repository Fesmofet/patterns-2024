const data = `city,population,area,density,country
  Shanghai,24256800,6340,3826,China
  Delhi,16787941,1484,11313,India
  Lagos,16060303,1171,13712,Nigeria
  Istanbul,14160467,5461,2593,Turkey
  Tokyo,13513734,2191,6168,Japan
  Sao Paulo,12038175,1521,7914,Brazil
  Mexico City,8874724,1486,5974,Mexico
  London,8673713,1572,5431,United Kingdom
  New York City,8537673,784,10892,United States
  Bangkok,8280925,1569,5279,Thailand`;

class CSVParser {
  constructor(csv) {
    this.csv = csv;
    this.keys = [];
    this.rows = [];
  }

  parse() {
    const lines = this.csv.trim().split('\n');
    const header = lines.shift();
    this.keys = header.split(',').map((key) => key.trim());
    this.rows = lines.map((line) => line.split(',').map((value) => value.trim()));
  }

  toObjects() {
    return this.rows.map((values) => this.keys.reduce((acc, key, index) => {
      const value = values[index];
      const num = Number(value);
      acc[key] = Number.isNaN(num) ? value : num;
      return acc;
    }, {}));
  }
}

class CSVValidator {
  static validate(csv) {
    const rows = csv.trim().split('\n');
    if (rows.length < 2) return false;
    const numColumns = rows[0].split(',').length;
    return rows.every((row) => row.split(',').length === numColumns);
  }
}

class DataProcessor {
  constructor(config = {}) {
    const {
      fieldToProcess = 'density',
      fieldToAdd = 'densityPercentage',
      indexToRemove = -1,
    } = config;

    this.fieldToProcess = fieldToProcess;
    this.fieldToAdd = fieldToAdd;
    this.indexToRemove = indexToRemove;
  }

  addField(objects) {
    const maxValue = Math.max(...objects.map((obj) => obj[this.fieldToProcess]));
    return objects.map((obj) => ({
      ...obj,
      [this.fieldToAdd]: maxValue !== 0
        ? Math.round((obj[this.fieldToProcess] * 100) / maxValue)
        : 0,
    }));
  }

  removeIndex(objects) {
    const adjustedIndex = this.indexToRemove < 0
      ? objects.length + this.indexToRemove
      : this.indexToRemove;

    if (adjustedIndex >= 0 && adjustedIndex < objects.length) {
      return objects.slice(0, adjustedIndex).concat(objects.slice(adjustedIndex + 1));
    }
    return objects;
  }
}

class Sorter {
  constructor(order = 'DESC') {
    this.order = order;
  }

  sortByKey(arr, key) {
    return [...arr].sort((a, b) => (this.order === 'DESC' ? b[key] - a[key] : a[key] - b[key]));
  }
}

class CSVController {
  constructor(csv) {
    this.csv = csv;
    this.validator = CSVValidator;
    this.parser = new CSVParser(csv);
    this.processor = new DataProcessor();
    this.sorter = new Sorter();
  }

  execute() {
    if (!this.validator.validate(this.csv)) throw new Error('Invalid CSV');

    this.parser.parse();
    let objects = this.parser.toObjects();

    objects = this.processor.addField(objects);
    objects = this.processor.removeIndex(objects);
    const sortedObjects = this.sorter.sortByKey(
      objects,
      this.processor.fieldToAdd,
    );

    return sortedObjects;
  }
}

const csvController = new CSVController(data);

// console.table(csvController.execute());

module.exports = {
  CSVParser,
  CSVValidator,
  DataProcessor,
  Sorter,
  CSVController,
};
