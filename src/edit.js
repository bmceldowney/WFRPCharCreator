import './style.css';
import feather from 'feather-icons';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.js';

const numericFields = [
  'level',
  'xp',
  'gold',
  'wounds',
  'strength',
  'toughness',
  'agility',
  'willpower'
];

const populateForm = (data) => {
  Object.entries(data).forEach(([key, value]) => {
    const input = document.getElementById(key);

    if (!input) {
      return;
    }

    if (input.type === 'number') {
      input.value = value ?? 0;
    } else {
      input.value = value ?? '';
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  feather.replace();

  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('id');
  const form = document.getElementById('characterForm');
  const pageTitle = document.getElementById('pageTitle');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');
  const originalSaveContent = saveBtn ? saveBtn.innerHTML : '';

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (characterId) {
    pageTitle.textContent = 'Edit Character';

    try {
      const characterRef = doc(db, 'characters', characterId);
      const document = await getDoc(characterRef);

      if (document.exists()) {
        populateForm(document.data());
      } else {
        console.warn('Character not found');
      }
    } catch (error) {
      console.error('Error getting document:', error);
      alert(`Error loading character: ${error.message}`);
    }
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const characterData = {};

    formData.forEach((value, key) => {
      if (numericFields.includes(key)) {
        characterData[key] = Number(value) || 0;
      } else {
        characterData[key] = value;
      }
    });

    if (!saveBtn) {
      return;
    }

    try {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `${feather.icons.loader.toSvg({ class: 'animate-spin w-4 h-4' })} Saving...`;
      feather.replace();

      if (characterId) {
        await updateDoc(doc(db, 'characters', characterId), characterData);
      } else {
        await addDoc(collection(db, 'characters'), characterData);
      }

      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error saving character:', error);
      alert(`Error saving character: ${error.message}`);
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalSaveContent;
      feather.replace();
    }
  });
});
