document.addEventListener('DOMContentLoaded', () => {
    const password = '10291998'; // Replace with your actual password

    const pokemonListElement = document.getElementById('pokemon-list');
    const authForm = document.getElementById('auth-form');
    const passwordInput = document.getElementById('password');

    function renderPokemonList(pokemonList) {
        pokemonListElement.innerHTML = '';
        pokemonList.forEach(pokemon => {
            const listItem = document.createElement('li');
            const imageName = pokemon.name.toLowerCase(); // Use the Pokémon's name for the image file name
            listItem.innerHTML = `
                <img src="../images/pokemon/normal/${imageName}.webp" alt="${pokemon.name}">
                <span>${pokemon.name}</span>
                <input type="checkbox" ${pokemon.obtained ? 'checked' : ''} data-id="${pokemon.id}">
            `;
            pokemonListElement.appendChild(listItem);
        });
    }

    function updatePokemonObtained(pokemonList, id, obtained) {
        const pokemon = pokemonList.find(p => p.id === id);
        if (pokemon) {
            pokemon.obtained = obtained;
        }
    }

    function savePokemonList(pokemonList) {
        const batch = db.batch();
        pokemonList.forEach(pokemon => {
            const docRef = db.collection('pokemon').doc(pokemon.id.toString());
            batch.set(docRef, pokemon);
        });
        batch.commit().then(() => {
            console.log('Batch write succeeded.');
        }).catch(error => {
            console.error('Error writing batch: ', error);
        });
    }

    function loadPokemonList() {
        return db.collection('pokemon').get().then(querySnapshot => {
            const pokemonList = [];
            querySnapshot.forEach(doc => {
                pokemonList.push(doc.data());
            });
            return pokemonList;
        });
    }

    loadPokemonList().then(pokemonList => {
        renderPokemonList(pokemonList);

        pokemonListElement.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                const id = parseInt(event.target.getAttribute('data-id'), 10);
                const obtained = event.target.checked;
                updatePokemonObtained(pokemonList, id, obtained);
            }
        });

        authForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent form submission from reloading the page
            if (passwordInput.value === password) {
                savePokemonList(pokemonList);
                alert('Changes confirmed!');
            } else {
                alert('Incorrect password!');
            }
            passwordInput.value = '';
        });
    }).catch(error => {
        console.error('Error loading Pokémon data:', error);
    });
});