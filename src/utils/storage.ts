export interface GeneratedItem {
  id: string;
  timestamp: number;
  images: string[]; // Base64 strings
  prompt: string;
  scene: string;
}

const STORAGE_KEY = "nanoprofile_history";
const MAX_ITEMS = 5; // Reduced from 20 to avoid quota limits

export const saveGeneration = (
  images: string[],
  prompt: string,
  scene: string
) => {
  const newItem: GeneratedItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    images,
    prompt,
    scene,
  };

  let history = getHistory();
  
  // Add new item to the beginning
  history = [newItem, ...history];

  // Helper to try saving
  const trySave = (items: GeneratedItem[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (error: any) {
      if (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED") {
        if (items.length <= 1) {
          // Can't remove any more items (except the new one), give up
          console.error("Storage full, cannot save new item even after clearing history");
          return false;
        }
        // Remove the oldest item (last one) and try again
        const reducedItems = items.slice(0, -1);
        return trySave(reducedItems);
      }
      console.error("Failed to save to localStorage", error);
      return false;
    }
  };

  // Initial attempt with max items constraint
  if (history.length > MAX_ITEMS) {
    history = history.slice(0, MAX_ITEMS);
  }

  if (trySave(history)) {
    return newItem;
  }
  
  return null;
};

export const getHistory = (): GeneratedItem[] => {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to read from localStorage", error);
    return [];
  }
};
