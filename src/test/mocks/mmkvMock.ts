/**
 * Test-only in-memory replacement for react-native-mmkv. Matches the API
 * surface the app uses (storage.ts, smartAlerts, hints, subscription cache).
 */
type Listener = (key: string) => void;

const stores = new Map<string, Map<string, string | number | boolean>>();

export class MMKV {
  private map: Map<string, string | number | boolean>;
  private listeners: Listener[] = [];

  constructor(config?: { id?: string; encryptionKey?: string }) {
    const id = config?.id ?? 'default';
    if (!stores.has(id)) stores.set(id, new Map());
    this.map = stores.get(id)!;
  }

  set(key: string, value: string | number | boolean): void {
    this.map.set(key, value);
    for (const l of this.listeners) l(key);
  }

  getString(key: string): string | undefined {
    const v = this.map.get(key);
    return typeof v === 'string' ? v : undefined;
  }

  getNumber(key: string): number | undefined {
    const v = this.map.get(key);
    return typeof v === 'number' ? v : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const v = this.map.get(key);
    return typeof v === 'boolean' ? v : undefined;
  }

  contains(key: string): boolean {
    return this.map.has(key);
  }

  delete(key: string): void {
    this.map.delete(key);
    for (const l of this.listeners) l(key);
  }

  getAllKeys(): string[] {
    return [...this.map.keys()];
  }

  clearAll(): void {
    this.map.clear();
  }

  addOnValueChangedListener(listener: Listener): { remove: () => void } {
    this.listeners.push(listener);
    return {
      remove: () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      },
    };
  }
}

/** Test helper: wipe every store between scenarios. */
export function __resetAllMmkvStores(): void {
  for (const store of stores.values()) store.clear();
}
