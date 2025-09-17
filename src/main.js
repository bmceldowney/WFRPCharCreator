import './style.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import feather from 'feather-icons';
import GLOBE from 'vanta/dist/vanta.globe.min.js';
import * as THREE from 'three';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase.js';

let vantaEffect;
let charactersContainer;

const createCharacterCard = (character, id) => `
  <div class="character-card bg-gray-800 rounded-xl p-6 shadow-lg cursor-pointer" data-id="${id}" data-aos="fade-up">
    <div class="flex items-start justify-between mb-4">
      <h3 class="text-2xl font-bold text-yellow-400">${character.name || 'Unnamed Character'}</h3>
      <span class="bg-gray-700 text-xs px-3 py-1 rounded-full">${character.race || 'Unknown'}</span>
    </div>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p class="text-sm text-gray-400">Class</p>
        <p class="font-medium">${character.class || 'Unknown'}</p>
      </div>
      <div>
        <p class="text-sm text-gray-400">Level</p>
        <p class="font-medium">${character.level || '1'}</p>
      </div>
      <div>
        <p class="text-sm text-gray-400">Gold</p>
        <p class="font-medium">${character.gold || '0'}</p>
      </div>
      <div>
        <p class="text-sm text-gray-400">XP</p>
        <p class="font-medium">${character.xp || '0'}</p>
      </div>
    </div>
    <div class="flex justify-between mt-6">
      <button class="edit-btn text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
        <i data-feather="edit" class="w-4 h-4"></i> Edit
      </button>
      <button class="delete-btn text-red-400 hover:text-red-300 flex items-center gap-1">
        <i data-feather="trash-2" class="w-4 h-4"></i> Delete
      </button>
    </div>
  </div>
`;

const initVantaBackground = () => {
  const background = document.getElementById('vanta-bg');

  if (!background) {
    return;
  }

  if (vantaEffect) {
    vantaEffect.destroy();
  }

  vantaEffect = GLOBE({
    el: background,
    THREE,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0xffd700,
    backgroundColor: 0x111827
  });
};

const showError = (message) => {
  if (!charactersContainer) {
    return;
  }

  // Create the error container
  const wrapper = document.createElement('div');
  wrapper.className = 'col-span-full text-center py-12';

  const iconDiv = document.createElement('div');
  iconDiv.className = 'text-red-400 mb-4';
  iconDiv.innerHTML = '<i data-feather="alert-triangle" class="w-12 h-12 mx-auto"></i>';

  const heading = document.createElement('h3');
  heading.className = 'text-xl font-semibold mb-2';
  heading.textContent = 'Error loading characters';

  const messageP = document.createElement('p');
  messageP.className = 'text-gray-400';
  messageP.textContent = message;

  wrapper.appendChild(iconDiv);
  wrapper.appendChild(heading);
  wrapper.appendChild(messageP);

  charactersContainer.innerHTML = '';
  charactersContainer.appendChild(wrapper);

  feather.replace();
};

const showEmptyState = () => {
  if (!charactersContainer) {
    return;
  }

  charactersContainer.innerHTML = `
    <div class="col-span-full text-center py-12 text-gray-400">
      <p class="text-lg">No characters found yet. Start by creating a new hero!</p>
    </div>
  `;
};

const renderCharacters = async () => {
  if (!charactersContainer) {
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, 'characters'));

    if (snapshot.empty) {
      showEmptyState();
      feather.replace();
      return;
    }

    const cards = [];
    snapshot.forEach((document) => {
      cards.push(createCharacterCard(document.data(), document.id));
    });

    charactersContainer.innerHTML = cards.join('');
    feather.replace();
    AOS.refreshHard();
  } catch (error) {
    console.error('Error loading characters:', error);
    showError(error.message);
  }
};

const handleCharacterActions = async (event) => {
  const target = event.target;
  const card = target.closest('.character-card');

  if (!card) {
    return;
  }

  const editTrigger = target.closest('.edit-btn');
  const deleteTrigger = target.closest('.delete-btn');
  const characterId = card.getAttribute('data-id');

  if (editTrigger) {
    window.location.href = `edit.html?id=${characterId}`;
    return;
  }

  if (deleteTrigger) {
    const shouldDelete = window.confirm('Are you sure you want to delete this character?');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'characters', characterId));
      card.remove();
      feather.replace();

      if (!charactersContainer.querySelector('.character-card')) {
        showEmptyState();
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      alert(`Error deleting character: ${error.message}`);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  charactersContainer = document.getElementById('charactersContainer');
  const addCharacterBtn = document.getElementById('addCharacterBtn');

  initVantaBackground();
  AOS.init();
  feather.replace();
  renderCharacters();

  if (addCharacterBtn) {
    addCharacterBtn.addEventListener('click', () => {
      window.location.href = 'edit.html';
    });
  }

  if (charactersContainer) {
    charactersContainer.addEventListener('click', handleCharacterActions);
  }
});

window.addEventListener('beforeunload', () => {
  if (vantaEffect) {
    vantaEffect.destroy();
  }
});
