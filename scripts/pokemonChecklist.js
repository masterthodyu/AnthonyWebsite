// Load environment variables from JSON file
fetch('../config/env.json')
    .then(response => response.json())
    .then(env => {
        // Store environment variables globally
        window.env = env;

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
                    const genContainers = {
                        gen1: document.getElementById('gen1'),
                        gen2: document.getElementById('gen2'),
                        gen3: document.getElementById('gen3'),
                        gen4: document.getElementById('gen4'),
                        gen5: document.getElementById('gen5'),
                        gen6: document.getElementById('gen6'),
                        gen7: document.getElementById('gen7'),
                        gen8: document.getElementById('gen8'),
                        gen9: document.getElementById('gen9')
                    };

                    for (let id in pokemonData) {
                        const pokemon = pokemonData[id];
                        const imgSrc = getPokemonImageSrc(pokemon); // Use function to get image path
                        console.log(`Loading image for ${pokemon.name} from ${imgSrc}`); // Debugging log
                        const obtainedClass = userObtainedData[id] ? 'obtained' : '';
                        const pokemonCard = document.createElement('div');
                        pokemonCard.className = `pokemon-card ${obtainedClass}`;
                        pokemonCard.setAttribute('onclick', `toggleObtained('${userId}', '${id}', this)`);
                        pokemonCard.innerHTML = `
                            <img src="${imgSrc}" alt="${pokemon.name}" loading="lazy" onerror="this.onerror=null;this.src='../images/pokemon/normal/default.webp';">
                            <p>#${pokemon.id} ${pokemon.name}</p>
                        `;

                        if (pokemon.id <= 151) {
                            genContainers.gen1.appendChild(pokemonCard);
                        } else if (pokemon.id <= 251) {
                            genContainers.gen2.appendChild(pokemonCard);
                        } else if (pokemon.id <= 386) {
                            genContainers.gen3.appendChild(pokemonCard);
                        } else if (pokemon.id <= 493) {
                            genContainers.gen4.appendChild(pokemonCard);
                        } else if (pokemon.id <= 649) {
                            genContainers.gen5.appendChild(pokemonCard);
                        } else if (pokemon.id <= 721) {
                            genContainers.gen6.appendChild(pokemonCard);
                        } else if (pokemon.id <= 809) {
                            genContainers.gen7.appendChild(pokemonCard);
                        } else if (pokemon.id <= 898) {
                            genContainers.gen8.appendChild(pokemonCard);
                        } else if (pokemon.id <= 1010) {
                            genContainers.gen9.appendChild(pokemonCard);
                        }
                    }
                });
            }).catch((error) => {
                console.error('Error fetching Pokémon data:', error); // Debugging log
            });
        }

        // Get Pokémon image source based on name and forms
        function getPokemonImageSrc(pokemon) {
            let baseSrc = `../images/pokemon/normal/${pokemon.name.toLowerCase()}`;
            let imgSrc = baseSrc;

            if (pokemon.alolan) {
                imgSrc = `${baseSrc}-alolan`;
            } else if (pokemon.galarian) {
                imgSrc = `${baseSrc}-galarian`;
            } else if (pokemon.hisuian) {
                imgSrc = `${baseSrc}-hisuian`;
            } else if (pokemon.paldean) {
                imgSrc = `${baseSrc}-paldean`;
            } else if (pokemon.gender) {
                imgSrc = `${baseSrc}-f`;
            }

            return `${imgSrc}.webp`;
        }

        // Define the toggleObtained function globally
        window.toggleObtained = function(userId, pokemonId, element) {
            const obtained = !element.classList.contains('obtained');
            element.classList.toggle('obtained', obtained);
            console.log(`Toggled obtained status for ${pokemonId} to ${obtained}`); // Debugging log
        }

        // Define the save function
        window.save = function() {
            const username = prompt("Enter your username:");
            const password = prompt("Enter your password:");

            if (username === window.env.USERNAME && password === window.env.PASSWORD) {
                const userId = window.env.USERNAME;
                const userRef = firebase.database().ref('users/' + userId);
                const obtainedElements = document.querySelectorAll('.pokemon-card.obtained');
                const obtainedData = {};

                obtainedElements.forEach(element => {
                    const pokemonId = element.getAttribute('onclick').match(/'([^']+)'/)[1];
                    obtainedData[pokemonId] = true;
                });

                userRef.child('obtained').set(obtainedData).then(() => {
                    console.log('Obtained Pokémon data saved to Firebase.');
                    alert('Data saved successfully!');
                }).catch((error) => {
                    console.error('Error saving obtained Pokémon data:', error); // Debugging log
                });

                // Update obtained count
                const obtainedCount = Object.keys(obtainedData).length;
                userRef.child('obtainedCount').set(obtainedCount).then(() => {
                    console.log('Obtained count updated to', obtainedCount);
                }).catch((error) => {
                    console.error('Error updating obtained count:', error); // Debugging log
                });
            } else {
                alert('Invalid username or password.');
            }
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
