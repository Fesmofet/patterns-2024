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

const isValidCSV = ({ csv }) => {
  const rows = csv.trim().split('\n');
  if (rows?.length < 2) return false;
  const numColumns = rows[0].split(',').length;
  return rows.every((row) => row.split(',').length === numColumns);
};

const createObject = ({ keys, values }) => keys.reduce((acc, key, index) => {
  const value = values[index];
  const num = Number(value);
  acc[key] = Number.isNaN(num) ? value : num;
  return acc;
}, {});

const getKeysAndRows = ({ csv }) => {
  const lines = csv.trim().split('\n');
  const header = lines.shift();
  const keys = header.split(',').map((key) => key.trim());
  const rows = lines.map((row) => row.split(',').map((value) => value.trim()));
  return { keys, rows };
};

const processCSVToObjects = ({ csv }) => {
  const { keys, rows } = getKeysAndRows({ csv });
  return rows.map((values) => createObject({ keys, values }));
};

const addOverallPercentage = ({
  object, max, fieldToAdd, fieldToProcess,
}) => ({
  ...object,
  [fieldToAdd]: Math.round((object[fieldToProcess] * 100) / max),
});

const getMaxByKey = ({ objects, key }) => Math.max(...objects.map((obj) => obj[key]));

const sortByKey = ({ arr, key, order = 'DESC' }) => [...arr]
  .sort((a, b) => (order === 'DESC' ? b[key] - a[key] : a[key] - b[key]));

const adjustIndex = ({ indexToRemove, arrayLength }) => {
  if (!Number.isInteger(indexToRemove)) return { adjustedIndex: indexToRemove, validIndex: false };
  const adjustedIndex = indexToRemove < 0 ? arrayLength + indexToRemove : indexToRemove;
  const validIndex = adjustedIndex >= 0 && adjustedIndex < arrayLength;
  return { adjustedIndex, validIndex };
};

const addFieldToObjects = ({ objects, fieldToProcess, fieldToAdd }) => {
  const max = getMaxByKey({ objects, key: fieldToProcess });
  return objects.map(
    (object) => addOverallPercentage({
      object, max, fieldToAdd, fieldToProcess,
    }),
  );
};

const removeObjectAtAdjustedIndex = ({ indexToRemove, objects }) => {
  const { adjustedIndex, validIndex } = adjustIndex({
    indexToRemove,
    arrayLength: objects.length,
  });
  if (validIndex) {
    const newObjects = [...objects];
    newObjects.splice(adjustedIndex, 1);
    return newObjects;
  }
  return objects;
};

const compose = (...functions) => (input) => functions.reduce((acc, fn) => fn(acc), input);

const logCSV = ({ csv }) => {
  const fieldToProcess = 'density';
  const fieldToAdd = 'densityPercentage';
  const indexToRemove = -1;

  const validCSV = isValidCSV({ csv });
  if (!validCSV) return console.log('Invalid CSV');

  const processedObjects = compose(
    processCSVToObjects,
    (objects) => addFieldToObjects({ objects, fieldToAdd, fieldToProcess }),
    (objects) => removeObjectAtAdjustedIndex({ indexToRemove, objects }),
    (arr) => sortByKey({ arr, key: fieldToAdd }),
  )({ csv });

  console.table(processedObjects);
};

logCSV({ csv: data });

module.exports = {
  createObject,
  processCSVToObjects,
  addOverallPercentage,
  getMaxByKey,
  sortByKey,
  isValidCSV,
};
