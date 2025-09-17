import './style.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import feather from 'feather-icons';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Character } from './types/character';

let charactersContainer: HTMLElement | null;

const formatValue = (value: string | number | null | undefined, fallback = 'N/A'): string | number => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return fallback;
  }

  return value;
};

const createCharacterCard = (character: Character, id: string): string => {
  const woundsDisplay = character.currentWounds !== undefined && character.startingWounds !== undefined
    ? `${formatValue(character.currentWounds)}/${formatValue(character.startingWounds)}`
    : formatValue(character.currentWounds ?? character.startingWounds);

  return `
    <div class="character-card bg-gray-800 rounded-xl p-6 shadow-lg cursor-pointer" data-id="${id}" data-aos="fade-up">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-2xl font-bold text-yellow-400">${formatValue(character.name, 'Unnamed Character')}</h3>
          <p class="text-sm text-gray-400">${formatValue(character.profession, 'Profession unknown')}</p>
        </div>
        <span class="bg-gray-700 text-xs px-3 py-1 rounded-full">${formatValue(character.race, 'Unknown')}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500">Battle Level</p>
          <p class="font-semibold text-sm">${formatValue(character.battleLevel)}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500">Gold</p>
          <p class="font-semibold text-sm">${formatValue(character.gold, 0)}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500">Wounds</p>
          <p class="font-semibold text-sm">${woundsDisplay || 'N/A'}</p>
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
};

const showError = (message: string): void => {
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

const showEmptyState = (): void => {
  if (!charactersContainer) {
    return;
  }

  charactersContainer.innerHTML = `
    <div class="col-span-full text-center py-12 text-gray-400">
      <p class="text-lg">No characters found yet. Start by creating a new hero!</p>
    </div>
  `;
};

const renderCharacters = async (): Promise<void> => {
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

    const cards: string[] = [];
    snapshot.forEach((document) => {
      const data = document.data() as Character;
      cards.push(createCharacterCard(data, document.id));
    });

    charactersContainer.innerHTML = cards.join('');
    feather.replace();
    AOS.refreshHard();
  } catch (error) {
    console.error('Error loading characters:', error);
    if (error instanceof Error) {
      showError(error.message);
    } else {
      showError('Unknown error loading characters');
    }
  }
};

const handleCharacterActions = async (event: MouseEvent): Promise<void> => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const card = target.closest<HTMLElement>('.character-card');

  if (!card) {
    return;
  }

  const editTrigger = target.closest('.edit-btn');
  const deleteTrigger = target.closest('.delete-btn');
  const characterId = card.getAttribute('data-id');

  if (!characterId) {
    return;
  }

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
      const message = error instanceof Error ? error.message : 'Unknown error';
      window.alert(`Error deleting character: ${message}`);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  charactersContainer = document.getElementById('charactersContainer');
  const addCharacterBtn = document.getElementById('addCharacterBtn');

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
