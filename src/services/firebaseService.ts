import { getFirestore, Firestore } from "firebase/firestore";
import { type FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECTID as string,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET as string,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID as string,
    appId: import.meta.env.VITE_FIREBASE_APPID as string,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

export { app, db, auth };