import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile,
    onAuthStateChanged 
  } from 'firebase/auth';
  import { auth } from './firebase';
  
  // Sign up with email and password
  export const signUp = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      return userCredential.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };
  
  // Sign in with email and password
  export const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };
  
  // Sign out
  export const logOut = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  // Get current user
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  // Listen for auth state changes
  export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
  };