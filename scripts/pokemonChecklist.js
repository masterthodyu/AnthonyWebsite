// Load environment variables from JSON file
fetch('../config/env.json')
    .then(response => response.json())
    .then(env => {
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            const firebaseConfig = {
                apiKey: env.FIREBASE_API_KEY,
                authDomain: env.FIREBASE_AUTH_DOMAIN,
                databaseURL: env.FIREBASE_DATABASE_URL,
                projectId: env.FIREBASE_PROJECT_ID,
                storageBucket: env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
                appId: env.FIREBASE_APP_ID
            };
            firebase.initializeApp(firebaseConfig);
        }
        const database = firebase.database();

        // Function to save Pokémon data to Firebase
        async function savePokemonDataToFirebase() {
            try {
                const response = await fetch('../data/dexDB.json'); // Correct path to dexDB.json
                const data = await response.json();
                if (data.length === 0) {
                    throw new Error('No Pokémon data found in the JSON file.');
                }
                data.forEach(pokemon => {
                    database.ref('pokemon/' + pokemon.id).set(pokemon);
                });
                console.log('Pokémon data saved to Firebase.');
            } catch (error) {
                console.error('Error saving Pokémon data to Firebase:', error.message);
            }
        }

        // Fetch Pokémon data from Firebase
        function fetchPokemonData(userId) {
            const pokemonContainer = document.getElementById('pokemon-container');
            console.log('Fetching Pokémon data...');
            database.ref('pokemon').once('value').then((snapshot) => {
                const pokemonData = snapshot.val();
                console.log('Fetched Pokémon data:', pokemonData); // Debugging log
                if (!pokemonData) {
                    console.error('No Pokémon data found in the database.');
                    return;
                }
                database.ref('users/' + userId + '/obtained').once('value').then((userSnapshot) => {
                    const userObtainedData = userSnapshot.val() || {};
                    let content = '';
                    for (let id in pokemonData) {
                        const pokemon = pokemonData[id];
                        const imgSrc = getPokemonImageSrc(pokemon); // Use function to get image path
                        console.log(`Loading image for ${pokemon.name} from ${imgSrc}`); // Debugging log
                        const obtainedClass = userObtainedData[id] ? 'obtained' : '';
                        content += `
                            <div class="pokemon-card ${obtainedClass}" onclick="toggleObtained('${userId}', '${id}', this)">
                                <img src="${imgSrc}" alt="${pokemon.name}" loading="lazy" onerror="this.onerror=null;this.src='../images/pokemon/normal/default.webp';">
                                <p>#${pokemon.id} ${pokemon.name}</p>
                            </div>
                        `;
                    }
                    pokemonContainer.innerHTML = content;
                    console.log('Content loaded into container:', content); // Debugging log
                });
            }).catch((error) => {
                console.error('Error fetching Pokémon data:', error); // Debugging log
            });
        }

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

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log('User is signed in:', user);
                const userId = env.USERNAME; // Use the username from embedded environment variables as userId
                fetchPokemonData(userId);
            } else {
                console.log('No user is signed in.');
                // Optionally, redirect to login page or show a message
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            // Save Pokémon data to Firebase
            savePokemonDataToFirebase();
        });
    })
    .catch(error => console.error('Error loading environment variables:', error));
