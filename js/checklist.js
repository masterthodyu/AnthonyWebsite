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
        localStorage.setItem('pokemonList', JSON.stringify(pokemonList));
    }

    function loadPokemonList() {
        const savedList = localStorage.getItem('pokemonList');
        return savedList ? JSON.parse(savedList) : null;
    }

    fetch('../js/pokemon.json')
        .then(response => response.json())
        .then(pokemonList => {
            const savedList = loadPokemonList();
            if (savedList) {
                pokemonList = savedList;
            }
            renderPokemonList(pokemonList);

            pokemonListElement.addEventListener('change', (event) => {
                if (event.target.type === 'checkbox') {
                    const id = parseInt(event.target.getAttribute('data-id'), 10);
                    const obtained = event.target.checked;
                    updatePokemonObtained(pokemonList, id, obtained);
                }
            });

            authForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (passwordInput.value === password) {
                    savePokemonList(pokemonList);
                    alert('Changes confirmed!');
                } else {
                    alert('Incorrect password!');
                }
                passwordInput.value = '';
            });
        })
        .catch(error => console.error('Error loading Pokémon data:', error));
});