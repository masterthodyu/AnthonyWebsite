// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXKt8fiGl1A5Q7Rwdfm8OqkV9sbKwK8ag",
    authDomain: "pokemon-checklist-8d6a5.firebaseapp.com",
    databaseURL: "https://pokemon-checklist-8d6a5-default-rtdb.firebaseio.com",
    projectId: "pokemon-checklist-8d6a5",
    storageBucket: "pokemon-checklist-8d6a5.firebasestorage.app",
    messagingSenderId: "605266308555",
    appId: "1:605266308555:web:df0cf4badb20dcdca9da4e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

async function fetchPokemonData() {
    try {
        const response = await fetch('../data/dexDB.json'); // Correct path to dexDB.json
        const data = await response.json();
        if (data.length === 0) {
            throw new Error('No Pokémon data found in the database.');
        }
        return data;
    } catch (error) {
        console.error(error.message);
        return [];
    }
}

fetchPokemonData().then(pokemonData => {
    if (pokemonData.length === 0) {
        console.error('No Pokémon data found in the database.');
    } else {
        const pokemonContainer = document.getElementById('pokemon-container');
        let content = '';
        pokemonData.forEach(pokemon => {
            const imgSrc = getPokemonImageSrc(pokemon); // Use function to get image path
            const obtainedClass = pokemon.obtained ? 'obtained' : '';
            content += `
                <div class="pokemon-card ${obtainedClass}" onclick="toggleObtained('${pokemon.id}', this)">
                    <img src="${imgSrc}" alt="${pokemon.name}" loading="lazy" onerror="this.onerror=null;this.src='../images/pokemon/normal/default.webp';">
                    <p>#${pokemon.id} ${pokemon.name}</p>
                </div>
            `;
        });
        pokemonContainer.innerHTML = content;
    }
});

// Get Pokémon image source based on name and forms
function getPokemonImageSrc(pokemon) {
    let imgSrc = `../images/pokemon/normal/${pokemon.name.toLowerCase()}.webp`;
    if (pokemon.alolan) {
        imgSrc = `../images/pokemon/normal/${pokemon.name.toLowerCase()}-alolan.webp`;
    } else if (pokemon.galarian) {
        imgSrc = `../images/pokemon/normal/${pokemon.name.toLowerCase()}-galarian.webp`;
    } else if (pokemon.hisuian) {
        imgSrc = `../images/pokemon/normal/${pokemon.name.toLowerCase()}-hisuian.webp`;
    } else if (pokemon.paldean) {
        imgSrc = `../images/pokemon/normal/${pokemon.name.toLowerCase()}-paldean.webp`;
    } else if (pokemon.gender) {
        imgSrc = `../images/pokemon/normal/${pokemon.name.toLowerCase()}-male.webp`;
    }
    return imgSrc;
}

// Toggle obtained status
function toggleObtained(id, element) {
    const obtained = !element.classList.contains('obtained');
    database.ref('pokemon/' + id).update({ obtained: obtained }).then(() => {
        element.classList.toggle('obtained', obtained);
        console.log(`Toggled obtained status for ${id} to ${obtained}`); // Debugging log
    }).catch((error) => {
        console.error('Error updating obtained status:', error); // Debugging log
    });
}

// Check whether the user is logged in
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log('User is signed in:', user);
        fetchPokemonData();
    } else {
        console.log('No user is signed in.');
        // Optionally, redirect to login page or show a message
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase authentication
    firebase.auth().signInAnonymously().catch(function(error) {
        console.error('Error signing in anonymously:', error);
    });
});
