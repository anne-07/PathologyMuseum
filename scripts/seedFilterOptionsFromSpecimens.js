// Script to populate filter options from all existing specimens
// Usage: node scripts/seedFilterOptionsFromSpecimens.js

const mongoose = require('mongoose');
const Specimen = require('../backend/models/Specimen');
const FilterOption = require('../backend/models/FilterOption');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pathology-museum';

async function main() {
  await mongoose.connect(MONGO_URI);
  const specimens = await Specimen.find();

  const types = ['category', 'organ', 'system', 'diagnosis'];
  const valuesByType = { category: new Set(), organ: new Set(), system: new Set(), diagnosis: new Set() };

  for (const specimen of specimens) {
    types.forEach(type => {
      if (specimen[type]) {
        valuesByType[type].add(specimen[type]);
      }
    });
  }

  for (const type of types) {
    for (const value of valuesByType[type]) {
      const exists = await FilterOption.findOne({ type, value });
      if (!exists) {
        await FilterOption.create({ type, value });
        console.log(`Added ${type}: ${value}`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('Done seeding filter options from specimens.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
