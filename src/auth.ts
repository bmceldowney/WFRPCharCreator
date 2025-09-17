import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
  type Unsubscribe
} from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let overlay: HTMLDivElement | null = null;
let errorMessageEl: HTMLParagraphElement | null = null;
let signInButton: HTMLButtonElement | null = null;

const ensureOverlay = (): void => {
  if (overlay) {
    return;
  }

  overlay = document.createElement('div');
  overlay.id = 'authOverlay';
  overlay.className = 'fixed inset-0 z-50 hidden flex items-center justify-center bg-gray-900/90 px-4';
  overlay.innerHTML = `
    <div class="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-2xl border border-gray-700 text-center space-y-6">
      <div>
        <h2 class="text-2xl font-semibold text-yellow-400 mb-2">Sign in to continue</h2>
        <p class="text-sm text-gray-400">
          Use your Google account to manage characters.
        </p>
      </div>
      <p class="h-5 text-sm text-red-400" id="authError"></p>
      <button
        id="googleSignInBtn"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-white py-2 px-4 font-semibold text-gray-900 transition hover:bg-gray-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.45 2.39 30.16 0 24 0 14.63 0 6.43 5.26 2.59 12.9l7.98 6.2C12.43 13.32 17.72 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.56-.14-3.06-.4-4.5H24v9h12.7c-.55 2.9-2.24 5.36-4.77 7.02l7.7 5.98C43.68 38.86 46.5 32.2 46.5 24.5z"/>
          <path fill="#FBBC05" d="M10.57 28.7c-.48-1.4-.75-2.9-.75-4.45s.27-3.05.75-4.45l-7.98-6.2C.93 16.9 0 20.34 0 24.25s.93 7.35 2.59 10.65l7.98-6.2z"/>
          <path fill="#34A853" d="M24 48c6.16 0 11.36-2.04 15.16-5.53l-7.7-5.98c-2.14 1.46-4.89 2.31-7.46 2.31-6.28 0-11.57-3.82-13.43-9.15l-7.98 6.2C6.43 42.74 14.63 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Sign in with Google
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  errorMessageEl = overlay.querySelector<HTMLParagraphElement>('#authError');
  signInButton = overlay.querySelector<HTMLButtonElement>('#googleSignInBtn');

  signInButton?.addEventListener('click', async () => {
    if (!signInButton) {
      return;
    }

    if (errorMessageEl) {
      errorMessageEl.textContent = '';
    }

    signInButton.disabled = true;

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      if (errorMessageEl) {
        errorMessageEl.textContent = message;
      }
      signInButton.disabled = false;
    }
  });
};

const showOverlay = (): void => {
  ensureOverlay();
  if (overlay) {
    overlay.classList.remove('hidden');
  }
  if (signInButton) {
    signInButton.focus();
  }
};

const hideOverlay = (): void => {
  if (overlay) {
    overlay.classList.add('hidden');
  }
  if (signInButton) {
    signInButton.disabled = false;
  }
};

export const requireAuth = (): Promise<User> =>
  new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          hideOverlay();
          resolve(user);
          unsubscribe();
        } else {
          showOverlay();
        }
      },
      (error) => {
        if (errorMessageEl) {
          errorMessageEl.textContent = error.message;
        }
        reject(error);
        unsubscribe();
      }
    );
  });

export const attachSignOutHandler = (button: HTMLElement | null): void => {
  if (!button) {
    return;
  }

  button.addEventListener('click', async () => {
    const originalText = button.textContent;
    button.setAttribute('disabled', 'true');
    button.textContent = 'Signing out...';

    try {
      await signOut(auth);
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error during sign out:', error);
      button.textContent = originalText ?? 'Sign Out';
      button.removeAttribute('disabled');
    }
  });
};

export const observeAuth = (callback: (user: User | null) => void): Unsubscribe =>
  onAuthStateChanged(auth, callback);

export const getCurrentUser = (): User | null => auth.currentUser;
