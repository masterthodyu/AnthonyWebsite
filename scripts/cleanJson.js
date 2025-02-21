const fs = require('fs');
const path = require('path');

// Load the JSON data
const filePath = path.join(__dirname, '../data/pokemonData.json');
const rawData = fs.readFileSync(filePath);
const pokemonData = JSON.parse(rawData);

// Function to clean up JSON data
function cleanJsonData(data) {
    const cleanedData = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const cleanedKey = key.replace(/[$#[\]./]/g, '');
            if (cleanedKey) {
                cleanedData[cleanedKey] = data[key];
            }
        }
    }
    return cleanedData;
}

// Clean the JSON data
const cleanedPokemonData = cleanJsonData(pokemonData);

// Save the cleaned JSON data
const cleanedFilePath = path.join(__dirname, '../data/cleanedPokemonData.json');
fs.writeFileSync(cleanedFilePath, JSON.stringify(cleanedPokemonData, null, 2));

console.log('Cleaned JSON data saved to:', cleanedFilePath);
