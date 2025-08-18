import { 
    signInAnonymously, 
    updateProfile, 
    onAuthStateChanged,
    type User
} from "firebase/auth";
import { auth } from "@config/firebase";


export const signInAnonymouslyIfNeeded = async (displayName: string): Promise<User> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");
    
    // Si ya hay un usuario, solo actualizamos su nombre si es diferente
    if (auth.currentUser) {
        if (auth.currentUser.displayName !== displayName) {
            await updateProfile(auth.currentUser, { displayName });
        }
        return auth.currentUser;
    }

    // Si no hay usuario, iniciamos sesión de forma anónima
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    // Y luego actualizamos su perfil con el nombre elegido
    await updateProfile(user, { displayName });
    
    return user;
};


export const onAuthUserChanged = (callback: (user: User | null) => void) => {
    if (!auth) throw new Error("Firebase auth is not initialized.");
    return onAuthStateChanged(auth, callback);
};