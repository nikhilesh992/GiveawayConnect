import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "@shared/schema";

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

export const firestoreService = {
  async createUser(userData: {
    firebaseUid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    referredBy?: string;
    isAnonymous?: boolean;
  }): Promise<FirestoreUser> {
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
      role: 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", userData.firebaseUid), newUser);
    
    return {
      ...newUser,
      createdAt: new Date(),
    };
  },

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

  async updateUser(firebaseUid: string, updates: Partial<FirestoreUser>): Promise<void> {
    if (!db) return;
    
    await updateDoc(doc(db, "users", firebaseUid), updates);
  },

  async updateUserRole(firebaseUid: string, role: number): Promise<void> {
    if (!db) return;
    
    await updateDoc(doc(db, "users", firebaseUid), { role });
  },
};
