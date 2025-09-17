import { observeAuth, attachSignOutHandler, requireAuth } from './auth';
import type { User } from 'firebase/auth';

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

const renderSignedInState = (actionsContainer: HTMLElement, user: User): void => {
  actionsContainer.innerHTML = '';

  const avatar = createAvatarElement(user);
  actionsContainer.appendChild(avatar);

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

export const initHeader = (): void => {
  const actionsContainer = document.getElementById('headerActions');

  if (!actionsContainer) {
    return;
  }

  observeAuth((user) => {
    if (user) {
      renderSignedInState(actionsContainer, user);
    } else {
      renderSignedOutState(actionsContainer);
    }
  });
};
