import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "atlantean-toolbox-998sv",
  appId: "1:649176169162:web:444c22719253728cc95233",
  apiKey: "AIzaSyDgN-sL1-4WxvIWOdzGTnpuKdaJTyq62q4",
  authDomain: "atlantean-toolbox-998sv.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-cartooncookingga-a4dd4bb6-9523-41c3-a7a3-fe7d503c8b7a",
  storageBucket: "atlantean-toolbox-998sv.firebasestorage.app",
  messagingSenderId: "649176169162"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
