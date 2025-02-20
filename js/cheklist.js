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
                <img src="../images/pokemon/normal/${imageName}.png" alt="${pokemon.name}">
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

    fetch('../js/pokemon.json')
        .then(response => response.json())
        .then(pokemonList => {
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
                    alert('Changes confirmed!');
                    // Here you can add code to save the changes to a server or local storage
                } else {
                    alert('Incorrect password!');
                }
                passwordInput.value = '';
            });
        })
        .catch(error => console.error('Error loading Pokémon data:', error));
});