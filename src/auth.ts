import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User, type Unsubscribe } from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);

let overlay: HTMLDivElement | null = null;
let errorMessageEl: HTMLParagraphElement | null = null;
let submitButton: HTMLButtonElement | null = null;
let emailInput: HTMLInputElement | null = null;
let passwordInput: HTMLInputElement | null = null;

const ensureOverlay = (): void => {
  if (overlay) {
    return;
  }

  overlay = document.createElement('div');
  overlay.id = 'authOverlay';
  overlay.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-gray-900/90 px-4';
  overlay.innerHTML = `
    <div class="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-2xl border border-gray-700">
      <h2 class="text-2xl font-semibold text-yellow-400 mb-4">Sign in to continue</h2>
      <p class="text-sm text-gray-400 mb-6">
        Enter the email and password for your Firebase user account.
      </p>
      <form class="space-y-4" id="authForm">
        <div>
          <label for="authEmail" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            id="authEmail"
            name="email"
            type="email"
            autocomplete="username"
            required
            class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 text-gray-100 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        <div>
          <label for="authPassword" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input
            id="authPassword"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 text-gray-100 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        <p class="h-5 text-sm text-red-400" id="authError"></p>
        <button
          type="submit"
          class="w-full rounded-lg bg-yellow-600 py-2 font-semibold text-gray-900 transition hover:bg-yellow-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign In
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const form = overlay.querySelector<HTMLFormElement>('#authForm');
  errorMessageEl = overlay.querySelector<HTMLParagraphElement>('#authError');
  submitButton = overlay.querySelector<HTMLButtonElement>('button[type="submit"]');
  emailInput = overlay.querySelector<HTMLInputElement>('#authEmail');
  passwordInput = overlay.querySelector<HTMLInputElement>('#authPassword');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!submitButton || !emailInput || !passwordInput) {
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (errorMessageEl) {
      errorMessageEl.textContent = '';
    }

    submitButton.disabled = true;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      if (errorMessageEl) {
        errorMessageEl.textContent = message;
      }
      submitButton.disabled = false;
      return;
    }

    submitButton.disabled = false;
  });
};

const showOverlay = (): void => {
  ensureOverlay();
  if (overlay) {
    overlay.classList.remove('hidden');
  }
  if (emailInput) {
    emailInput.focus();
  }
};

const hideOverlay = (): void => {
  if (overlay) {
    overlay.classList.add('hidden');
  }
  if (passwordInput) {
    passwordInput.value = '';
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
