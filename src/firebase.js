import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD6grYVHjypUQW5KfG2yWqVhd9G--IVfwA',
  authDomain: 'warhammerquestcharacters.firebaseapp.com',
  projectId: 'warhammerquestcharacters',
  storageBucket: 'warhammerquestcharacters.appspot.com',
  messagingSenderId: '535458585770',
  appId: '1:535458585770:web:5ae7538fd639ec0689c4d3',
  measurementId: 'G-KW1060JDCM'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { app, firebaseConfig };
