/**
 * Mock Storage Layer - localStorage-based data persistence
 * Mimics Supabase API for seamless development without backend
 */

// Generate UUID-like ID for new records
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

// Storage keys
const STORAGE_KEYS = {
  FILES: 'mock_files',
  PIS: 'mock_pis',
  SPONSORS: 'mock_sponsors',
  FILE_ATTACHMENTS: 'mock_file_attachments',
  ACTION_ITEMS: 'mock_action_items',
};

// Generic localStorage operations
export const mockStorage = {
  // Get all records from a table
  getAll: <T>(key: string): T[] => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return [];
    }
  },

  // Get single record by ID
  getById: <T extends { id: string }>(key: string, id: string): T | null => {
    const records = mockStorage.getAll<T>(key);
    return records.find(r => r.id === id) || null;
  },

  // Insert new record
  insert: <T extends { id?: string }>(key: string, record: T): T => {
    const records = mockStorage.getAll<T>(key);
    const newRecord = {
      ...record,
      id: record.id || generateId(),
      created_at: new Date().toISOString(),
    } as T;
    records.push(newRecord);
    localStorage.setItem(key, JSON.stringify(records));
    return newRecord;
  },

  // Update existing record
  update: <T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null => {
    const records = mockStorage.getAll<T>(key);
    const index = records.findIndex(r => r.id === id);

    if (index === -1) return null;

    const updatedRecord = {
      ...records[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    records[index] = updatedRecord;
    localStorage.setItem(key, JSON.stringify(records));
    return updatedRecord;
  },

  // Delete record
  delete: (key: string, id: string): boolean => {
    const records = mockStorage.getAll(key);
    const filtered = records.filter(r => r.id !== id);

    if (filtered.length === records.length) return false;

    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  },

  // Query with filter
  query: <T>(key: string, filter: (record: T) => boolean): T[] => {
    const records = mockStorage.getAll<T>(key);
    return records.filter(filter);
  },

  // Set initial data (for first load)
  setInitialData: <T>(key: string, data: T[]): void => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  },

  // Clear all data (for testing)
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

export { STORAGE_KEYS };
