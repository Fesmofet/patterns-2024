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

class CustomSort {
  static sortByKey({ arr, key, order = 'DESC' }) {
    return [...arr]
      .sort((a, b) => (order === 'DESC' ? b[key] - a[key] : a[key] - b[key]));
  }
}

class ValidatorCSV {
  static validate(csv) {
    const rows = csv.trim().split('\n');
    if (rows?.length < 2) return false;
    const numColumns = rows[0].split(',').length;
    return rows.every((row) => row.split(',').length === numColumns);
  }
}

class ProcessorCSV {
  constructor(config = {}) {
    const {
      outputSorter = CustomSort,
      indexToRemove = -1,
      fieldToProcess = 'density',
      fieldToAdd = 'densityPercentage',
    } = config;

    this.indexToRemove = indexToRemove;
    this.fieldToProcess = fieldToProcess;
    this.fieldToAdd = fieldToAdd;
    this.outputSorter = outputSorter;
  }

  getKeysAndRows({ csv }) {
    const lines = csv.trim().split('\n');
    const header = lines.shift();
    const keys = header.split(',').map((key) => key.trim());
    const rows = lines.map((row) => row.split(',').map((value) => value.trim()));
    return { keys, rows };
  }

  createObject({ keys, values }) {
    return keys.reduce((acc, key, index) => {
      const value = values[index];
      const num = Number(value);
      acc[key] = Number.isNaN(num) ? value : num;
      return acc;
    }, {});
  }

  getMaxByKey({ objects }) {
    return Math.max(...objects.map((obj) => obj[this.fieldToProcess]));
  }

  addOverallPercentage({
    object, max,
  }) {
    return {
      ...object,
      [this.fieldToAdd]: Math.round((object[this.fieldToProcess] * 100) / max),
    };
  }

  addFieldToObjects({ objects }) {
    const max = this.getMaxByKey({ objects });
    return objects.map((object) => this.addOverallPercentage({ object, max }));
  }

  adjustIndex({ arrayLength }) {
    if (!Number.isInteger(this.indexToRemove)) {
      return { adjustedIndex: this.indexToRemove, validIndex: false };
    }
    const adjustedIndex = this.indexToRemove < 0
      ? arrayLength + this.indexToRemove
      : this.indexToRemove;
    const validIndex = adjustedIndex >= 0 && adjustedIndex < arrayLength;
    return { adjustedIndex, validIndex };
  }

  processCSVToObjects({ csv }) {
    const { keys, rows } = this.getKeysAndRows({ csv });
    return rows.map((values) => this.createObject({ keys, values }));
  }

  process(input) {
    const objects = this.processCSVToObjects({ csv: input });
    const objectsWithPercentage = this.addFieldToObjects({ objects });

    const { adjustedIndex, validIndex } = this.adjustIndex({
      arrayLength: objectsWithPercentage.length,
    });
    if (validIndex) objectsWithPercentage.splice(adjustedIndex, 1);

    return this.outputSorter.sortByKey({
      arr: objectsWithPercentage,
      key: this.fieldToAdd,
    });
  }
}

class Logger {
  constructor({ inputValidator, inputProcessor }) {
    this.inputValidator = inputValidator;
    this.inputProcessor = inputProcessor;
  }

  log(input) {
    const valid = this.inputValidator.validate(input);
    if (!valid) return console.log('Invalid input');
    const processedItems = this.inputProcessor.process(input);
    console.table(processedItems);
  }
}

const csvLogger = new Logger({
  inputValidator: ValidatorCSV,
  inputProcessor: new ProcessorCSV(),
});

csvLogger.log(data);
