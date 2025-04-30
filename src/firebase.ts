import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth,GoogleAuthProvider } from 'firebase/auth'


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app) //auth object now gives access to all the authentication services provided by firebase
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider() //provider needed for google login
//for normal username/password login system a provider class not needed
