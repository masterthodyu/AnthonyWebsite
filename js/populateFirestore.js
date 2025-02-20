const admin = require('firebase-admin');
const fs = require('fs');

// Path to your service account key file
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pokemon-checklist-8d6a5-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

// Read the pokemon.json file
fs.readFile('./js/pokemon.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading pokemon.json file:', err);
    return;
  }

  const pokemonList = JSON.parse(data);

  // Write each Pokémon to Firestore
  pokemonList.forEach(async (pokemon) => {
    try {
      await db.collection('pokemon').doc(pokemon.id.toString()).set(pokemon);
      console.log(`Document written with ID: ${pokemon.id}`);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  });
});