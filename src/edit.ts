import './style.css';
import feather from 'feather-icons';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Character } from './types/character';

type NumericField =
  | 'battleLevel'
  | 'movement'
  | 'weaponSkill'
  | 'ballisticsSkill'
  | 'strength'
  | 'toughness'
  | 'initiative'
  | 'willpower'
  | 'attacks'
  | 'pinning'
  | 'luck'
  | 'startingWounds'
  | 'currentWounds'
  | 'gold'
  | 'goldToNextLevel';

type ArrayField = 'items' | 'skills';

const numericFields: NumericField[] = [
  'battleLevel',
  'movement',
  'weaponSkill',
  'ballisticsSkill',
  'strength',
  'toughness',
  'initiative',
  'willpower',
  'attacks',
  'pinning',
  'luck',
  'startingWounds',
  'currentWounds',
  'gold',
  'goldToNextLevel'
];

const arrayFields: ArrayField[] = ['items', 'skills'];

const populateForm = (data: Partial<Character>): void => {
  Object.entries(data).forEach(([key, value]) => {
    const input = document.getElementById(key) as HTMLInputElement | HTMLTextAreaElement | null;

    if (!input) {
      return;
    }

    if (Array.isArray(value)) {
      input.value = value.join('\n');
      return;
    }

    if (input instanceof HTMLInputElement && input.type === 'number') {
      input.value = String(value ?? 0);
      return;
    }

    input.value = typeof value === 'string' ? value : value !== undefined ? String(value) : '';
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  feather.replace();

  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('id');
  const form = document.getElementById('characterForm') as HTMLFormElement | null;
  const pageTitle = document.getElementById('pageTitle');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement | null;
  const originalSaveContent = saveBtn ? saveBtn.innerHTML : '';

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (characterId) {
    if (pageTitle) {
      pageTitle.textContent = 'Edit Character';
    }

    try {
      const characterRef = doc(db, 'characters', characterId);
      const documentSnapshot = await getDoc(characterRef);

      if (documentSnapshot.exists()) {
        populateForm(documentSnapshot.data() as Character);
      } else {
        console.warn('Character not found');
      }
    } catch (error) {
      console.error('Error getting document:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      window.alert(`Error loading character: ${message}`);
    }
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const characterData: Partial<Character> = {};

    formData.forEach((value, key) => {
      if (numericFields.includes(key as NumericField)) {
        const numericValue = typeof value === 'string' ? Number(value) : Number.NaN;
        characterData[key as NumericField] = Number.isNaN(numericValue) ? 0 : numericValue;
        return;
      }

      if (arrayFields.includes(key as ArrayField)) {
        if (typeof value === 'string') {
          const entries = value
            .split(/\r?\n/)
            .map((entry) => entry.trim())
            .filter(Boolean);
          characterData[key as ArrayField] = entries;
        }
        return;
      }

      if (typeof value === 'string') {
        characterData[key as keyof Character] = value.trim() as Character[keyof Character];
      }
    });

    if (!saveBtn) {
      return;
    }

    try {
      saveBtn.disabled = true;
      const loaderIcon = feather.icons.loader?.toSvg({ class: 'animate-spin w-4 h-4' }) ?? '';
      saveBtn.innerHTML = `${loaderIcon} Saving...`;
      feather.replace();

      if (characterId) {
        await updateDoc(doc(db, 'characters', characterId), characterData);
      } else {
        await addDoc(collection(db, 'characters'), characterData);
      }

      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error saving character:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      window.alert(`Error saving character: ${message}`);
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalSaveContent;
      feather.replace();
    }
  });
});
