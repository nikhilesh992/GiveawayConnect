import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

let db: any = null;

try {
  if (!getApps().length && process.env.VITE_FIREBASE_API_KEY) {
    const app = initializeApp(firebaseConfig, 'server');
    db = getFirestore(app);
  } else if (getApps().length > 0) {
    db = getFirestore(getApps()[0]);
  }
} catch (error) {
  console.warn("Firebase initialization failed on server:", error);
}

export interface FirestoreUser {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  points: number;
  referralCode: string;
  referredBy?: string;
  isAnonymous: boolean;
  role: number;
  createdAt: any;
}

export const serverFirestoreService = {
  async getUser(firebaseUid: string): Promise<FirestoreUser | null> {
    if (!db) return null;
    
    const userDoc = await getDoc(doc(db, "users", firebaseUid));
    
    if (userDoc.exists()) {
      const data = userDoc.data() as FirestoreUser;
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      };
    }
    
    return null;
  },

  async createUser(userData: {
    firebaseUid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    referredBy?: string;
    isAnonymous?: boolean;
    role?: number;
  }): Promise<FirestoreUser | null> {
    if (!db) return null;
    
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const newUser: FirestoreUser = {
      id: userData.firebaseUid,
      firebaseUid: userData.firebaseUid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      points: 0,
      referralCode,
      referredBy: userData.referredBy,
      isAnonymous: userData.isAnonymous || false,
      role: userData.role || 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", userData.firebaseUid), newUser);
    
    return {
      ...newUser,
      createdAt: new Date(),
    };
  },

  async updateUserPoints(firebaseUid: string, pointsToAdd: number): Promise<void> {
    if (!db) return;
    
    await updateDoc(doc(db, "users", firebaseUid), {
      points: increment(pointsToAdd),
    });
  },

  async updateUserRole(firebaseUid: string, role: number): Promise<void> {
    if (!db) return;
    
    await updateDoc(doc(db, "users", firebaseUid), { role });
  },

  async getAllUsers(): Promise<FirestoreUser[]> {
    if (!db) return [];
    
    const { collection, getDocs } = await import("firebase/firestore");
    const usersSnapshot = await getDocs(collection(db, "users"));
    
    return usersSnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreUser;
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      };
    });
  },
};
