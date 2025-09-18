import { observeAuth, attachSignOutHandler, requireAuth } from './auth';
import type { User } from 'firebase/auth';

interface HeaderOptions {
  showAddButton?: boolean;
  onAddCharacter?: () => void;
}

const createAvatarElement = (user: User): HTMLElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-center gap-2';

  if (user.photoURL) {
    const img = document.createElement('img');
    img.src = user.photoURL;
    img.referrerPolicy = 'no-referrer';
    img.crossOrigin = 'anonymous';
    img.loading = 'lazy';
    img.decoding = 'async';
    console.log('User photo URL:', user.photoURL);
    img.alt = user.displayName ?? 'User avatar';
    img.className = 'h-8 w-8 rounded-full border border-yellow-400/40 object-cover shadow-sm';
    wrapper.appendChild(img);
  } else {
    const initial = document.createElement('div');
    const fallback = (user.displayName || user.email || '?').charAt(0).toUpperCase();
    initial.textContent = fallback;
    initial.className = 'flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-sm font-semibold text-yellow-400 border border-yellow-400/40';
    wrapper.appendChild(initial);
  }

  const textWrapper = document.createElement('div');
  textWrapper.className = 'hidden flex-col text-left text-xs text-gray-300 sm:flex';

  if (user.displayName) {
    const nameEl = document.createElement('span');
    nameEl.textContent = user.displayName;
    nameEl.className = 'font-semibold text-gray-100';
    textWrapper.appendChild(nameEl);
  }

  if (user.email) {
    const emailEl = document.createElement('span');
    emailEl.textContent = user.email;
    emailEl.className = 'text-gray-400';
    textWrapper.appendChild(emailEl);
  }

  if (textWrapper.childElementCount > 0) {
    wrapper.appendChild(textWrapper);
  }

  return wrapper;
};

const renderSignedInState = (actionsContainer: HTMLElement, user: User, options?: HeaderOptions): void => {
  actionsContainer.innerHTML = '';

  const avatar = createAvatarElement(user);
  actionsContainer.appendChild(avatar);

  if (options?.showAddButton && options.onAddCharacter) {
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-yellow-400 focus:outline-none';
    addBtn.innerHTML = `
      <span class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </span>
      <span>Add Character</span>
    `;

    addBtn.addEventListener('click', () => {
      options.onAddCharacter?.();
    });

    actionsContainer.appendChild(addBtn);
  }

  const signOutBtn = document.createElement('button');
  signOutBtn.type = 'button';
  signOutBtn.className = 'rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-yellow-500 hover:text-yellow-400';
  signOutBtn.textContent = 'Sign Out';

  actionsContainer.appendChild(signOutBtn);

  attachSignOutHandler(signOutBtn);
};

const renderSignedOutState = (actionsContainer: HTMLElement): void => {
  actionsContainer.innerHTML = '';

  const loginBtn = document.createElement('button');
  loginBtn.type = 'button';
  loginBtn.className = 'rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-yellow-400 focus:outline-none';
  loginBtn.textContent = 'Sign In';

  loginBtn.addEventListener('click', () => {
    requireAuth().catch((error) => {
      console.error('Sign-in error:', error);
    });
  });

  actionsContainer.appendChild(loginBtn);
};

export const initHeader = (options: HeaderOptions = {}): void => {
  const actionsContainer = document.getElementById('headerActions');

  if (!actionsContainer) {
    return;
  }

  observeAuth((user) => {
    if (user) {
      renderSignedInState(actionsContainer, user, options);
    } else {
      renderSignedOutState(actionsContainer);
    }
  });
};
