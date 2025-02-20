import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
        pokemonList.forEach(async (pokemon) => {
            try {
                await setDoc(doc(db, 'pokemon', pokemon.id.toString()), pokemon);
                console.log(`Document updated with ID: ${pokemon.id}`);
            } catch (error) {
                console.error('Error updating document:', error);
            }
        });
    }

    async function loadPokemonList() {
        const querySnapshot = await getDocs(collection(db, 'pokemon'));
        const pokemonList = [];
        querySnapshot.forEach(doc => {
            pokemonList.push(doc.data());
        });
        return pokemonList;
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