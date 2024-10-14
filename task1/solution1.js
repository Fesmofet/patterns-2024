// Tasks for rewriting:
//   - Apply optimizations of computing resources: processor, memory
//   - Minimize cognitive complexity
//   - Respect SRP and SoC
//   - Improve readability (understanding), reliability
//   - Optimize for maintainability, reusability, flexibility
//   - Make code testable
//   - Implement simple unittests without frameworks
//   - Try to implement in multiple paradigms: OOP, FP, procedural, mixed

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

const createObject = ({ keys, values }) => keys.reduce((acc, key, index) => {
  const value = values[index];
  const num = Number(value);
  acc[key] = Number.isNaN(num) ? value : num;
  return acc;
}, {});

const processDataString = ({ dataString }) => {
  const rows = dataString.trim().split('\n');
  const header = rows.shift();
  const keys = header.split(',').map((key) => key.trim());

  return rows.map((row) => {
    const values = row.split(',').map((value) => value.trim());
    return createObject({ keys, values });
  });
};

const addOverallPercentage = ({
  object, max, fieldToAdd, fieldToProcess,
}) => ({
  ...object,
  [fieldToAdd]: Math.round((object[fieldToProcess] * 100) / max),
});

const getMaxByKey = ({ objects, key }) => Math.max(...objects.map((obj) => obj[key]));

const sortByKeyDESC = ({ arr, key }) => [...arr].sort((a, b) => b[key] - a[key]);

const consoleData = ({ dataString, fieldToProcess, fieldToAdd }) => {
  const objects = processDataString({ dataString });
  const max = getMaxByKey({ objects, key: fieldToProcess });

  const objectsWithDensityPercentage = objects.map((object) => addOverallPercentage({
    object,
    max,
    fieldToAdd,
    fieldToProcess,
  }));

  console.table(sortByKeyDESC({ arr: objectsWithDensityPercentage, key: fieldToAdd }));
};

consoleData({
  dataString: data,
  fieldToAdd: 'densityPercentage',
  fieldToProcess: 'density',
});

module.exports = {
  createObject,
  processDataString,
  addOverallPercentage,
  getMaxByKey,
  sortByKeyDESC,
};
