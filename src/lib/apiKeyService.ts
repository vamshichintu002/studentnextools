import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const saveApiKey = async (userId: string, apiKey: string) => {
  try {
    await setDoc(doc(db, 'apiKeys', userId), {
      geminiKey: apiKey,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
};

export const getApiKey = async (userId: string) => {
  try {
    const docRef = doc(db, 'apiKeys', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().geminiKey;
    }
    return null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};
