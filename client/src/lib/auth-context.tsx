import { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithRedirect, 
  signOut as firebaseSignOut, 
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, hasValidConfig } from "./firebase";
import { firestoreService } from "./firestore-service";
import type { User } from "@shared/schema";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is not configured, just set loading to false
    if (!hasValidConfig || !auth) {
      console.warn("Firebase is not configured. Please add Firebase credentials to use authentication.");
      setLoading(false);
      return;
    }

    try {
      // Handle redirect result on page load
      getRedirectResult(auth).catch((error) => {
        console.warn("Firebase redirect error:", error.message);
      });

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          try {
            let firestoreUser = await firestoreService.getUser(firebaseUser.uid);
            
            if (!firestoreUser) {
              firestoreUser = await firestoreService.createUser({
                firebaseUid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "Anonymous",
                photoURL: firebaseUser.photoURL || undefined,
                isAnonymous: firebaseUser.isAnonymous,
              });
            }
            
            const userData: User = {
              id: firestoreUser.id,
              firebaseUid: firestoreUser.firebaseUid,
              email: firestoreUser.email,
              displayName: firestoreUser.displayName,
              photoURL: firestoreUser.photoURL || null,
              points: firestoreUser.points,
              referralCode: firestoreUser.referralCode,
              referredBy: firestoreUser.referredBy || null,
              isAnonymous: firestoreUser.isAnonymous,
              isAdmin: firestoreUser.role === 1,
              role: firestoreUser.role,
              createdAt: firestoreUser.createdAt,
            };
            
            setUser(userData);
          } catch (error) {
            console.error("Error fetching/creating user in Firestore:", error);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }, (error: any) => {
        console.warn("Firebase auth error:", error.message);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.warn("Firebase initialization error:", error);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error("Firebase is not configured. Please configure Firebase in Admin Settings.");
    }
    await signInWithRedirect(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please configure Firebase in Admin Settings.");
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please configure Firebase in Admin Settings.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
  };

  const signInAsGuest = async () => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please configure Firebase in Admin Settings.");
    }
    await signInAnonymously(auth);
  };

  const signOut = async () => {
    if (!auth) {
      return;
    }
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      firebaseUser, 
      user, 
      loading, 
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      signInAsGuest,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
