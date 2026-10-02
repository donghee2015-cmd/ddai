import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBziwYmZywfAU70j7QqnvmgWHOlLm78zjE",
  authDomain: "visit-5b4f9.firebaseapp.com",
  projectId: "visit-5b4f9",
  storageBucket: "visit-5b4f9.firebasestorage.app",
  messagingSenderId: "420618075306",
  appId: "1:420618075306:web:c9d8c875213c787be964d3"
};

// Initialize Firebase safely
let app: FirebaseApp;
let db: Firestore | null = null;
let isFirebaseReady = false;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirebaseReady = true;
} catch (err) {
  console.warn('Firebase init notice:', err);
}

export { db, isFirebaseReady };

export type EmotionType = '기쁨' | '지침' | '설렘' | '불안';

export interface AIResponse {
  empathyMessage: string;
  actionSuggestion: string;
  comfortQuote?: string;
  cheerSummary?: string;
}

export interface DiaryEntry {
  id: string;
  dateStr: string;
  emotion: EmotionType;
  weather?: string;
  title?: string;
  content: string;
  aiResponse: AIResponse;
  createdAt: number;
  syncedToFirebase?: boolean;
}

const LOCAL_STORAGE_KEY = 'warm_daily_diaries_v1';

// Local storage helper
export function getLocalDiaries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load local diaries', e);
    return [];
  }
}

export function saveLocalDiaries(diaries: DiaryEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diaries));
  } catch (e) {
    console.error('Failed to save local diaries', e);
  }
}

// Save a diary entry to both Firebase Firestore and LocalStorage
export async function saveDiaryEntry(
  entryData: Omit<DiaryEntry, 'id' | 'createdAt' | 'syncedToFirebase'>
): Promise<DiaryEntry> {
  const newId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = Date.now();

  const newEntry: DiaryEntry = {
    ...entryData,
    id: newId,
    createdAt: now,
    syncedToFirebase: false,
  };

  // 1. Immediately update LocalStorage for instant UI feedback
  const existingLocal = getLocalDiaries();
  const updatedLocal = [newEntry, ...existingLocal.filter((d) => d.id !== newId)];
  saveLocalDiaries(updatedLocal);

  // 2. Try Firestore persistence
  if (db && isFirebaseReady) {
    try {
      const colRef = collection(db, 'diaries');
      const docRef = await addDoc(colRef, {
        dateStr: entryData.dateStr,
        emotion: entryData.emotion,
        weather: entryData.weather || '맑음',
        title: entryData.title || '',
        content: entryData.content,
        aiResponse: entryData.aiResponse,
        createdAt: serverTimestamp(),
        clientTimestamp: now,
      });

      // Update entry with firestore ID
      newEntry.id = docRef.id;
      newEntry.syncedToFirebase = true;

      // Update in local store as well
      const syncedList = getLocalDiaries().map((d) => (d.id === newId ? newEntry : d));
      saveLocalDiaries(syncedList);
    } catch (firebaseErr) {
      console.warn('Firestore write notice (falling back to local cache):', firebaseErr);
    }
  }

  return newEntry;
}

// Fetch diaries from Firestore, falling back to LocalStorage
export async function fetchDiaries(): Promise<{ diaries: DiaryEntry[]; isFromFirebase: boolean }> {
  const localList = getLocalDiaries();

  if (db && isFirebaseReady) {
    try {
      const colRef = collection(db, 'diaries');
      const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const firestoreList: DiaryEntry[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.clientTimestamp || Date.now();
          return {
            id: docSnap.id,
            dateStr: data.dateStr || new Date(createdAt).toLocaleDateString('ko-KR'),
            emotion: data.emotion as EmotionType,
            weather: data.weather || '맑음',
            title: data.title || '',
            content: data.content || '',
            aiResponse: data.aiResponse || {
              empathyMessage: '따뜻한 마음으로 당신의 하루를 응원합니다.',
              actionSuggestion: '잠시 눈을 감고 편안한 호흡을 세 번 해보세요.',
            },
            createdAt,
            syncedToFirebase: true,
          };
        });

        // Merge and deduplicate
        const mergedMap = new Map<string, DiaryEntry>();
        // Add local ones first
        localList.forEach((item) => mergedMap.set(item.id, item));
        // Override with Firestore items
        firestoreList.forEach((item) => mergedMap.set(item.id, item));

        const merged = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
        saveLocalDiaries(merged);
        return { diaries: merged, isFromFirebase: true };
      }
    } catch (e) {
      console.warn('Firestore read error, using local fallback:', e);
    }
  }

  return { diaries: localList, isFromFirebase: false };
}

// Delete diary entry
export async function deleteDiaryEntry(id: string): Promise<void> {
  // Delete from local
  const current = getLocalDiaries();
  saveLocalDiaries(current.filter((d) => d.id !== id));

  // If it's a Firestore document id (not local_), try deleting from Firestore
  if (!id.startsWith('local_') && db && isFirebaseReady) {
    try {
      await deleteDoc(doc(db, 'diaries', id));
    } catch (e) {
      console.warn('Could not delete from Firestore:', e);
    }
  }
}
