/**
 * BUG-C001 regression: startup recovery must distinguish an interrupted
 * onboarding (purge is safe) from a restored install where the SQLite DB
 * survived but MMKV came up empty because the encryption key lives in the
 * Keystore and does not transfer between devices. The old code purged in
 * both cases, silently CASCADE-deleting the user's entire medical history.
 *
 * Runs against the REAL repositories on in-memory SQLite + in-memory MMKV,
 * same harness as the user-scenario fuzz.
 */
import { petRepository, glucoseRepository, getDatabase } from '@storage/database';
import { closeDatabase } from '@storage/database/database';
import { initStorage, storage, StorageKeys, vetNameKey } from '@storage/mmkv/storage';
import { __resetAllMmkvStores } from '../test/mocks/mmkvMock';
import { runStartupRecovery } from '@core/startupRecovery';

async function agePet(petId: string, ageMs: number): Promise<void> {
  const db = await getDatabase();
  const createdAt = new Date(Date.now() - ageMs).toISOString();
  await db.runAsync('UPDATE pets SET created_at = ? WHERE id = ?', [createdAt, petId]);
}

const DAY_MS = 24 * 60 * 60 * 1000;

describe('startup recovery (BUG-C001)', () => {
  beforeAll(async () => {
    await initStorage();
  });

  beforeEach(async () => {
    await closeDatabase();
    __resetAllMmkvStores();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('adopts a restored DB instead of purging it (device migration, MMKV empty)', async () => {
    const pet = await petRepository.create({ name: 'Мурка', species: 'cat', gender: 'female' });
    await agePet(pet.id, 30 * DAY_MS);
    const reading = await glucoseRepository.create({
      petId: pet.id,
      value: 8.4,
      unit: 'mmol/L',
      mealRelation: 'fasting',
      recordedAt: new Date(Date.now() - 29 * DAY_MS).toISOString(),
    });

    await runStartupRecovery();

    // Data survived
    const pets = await petRepository.findActive();
    expect(pets.map(p => p.id)).toEqual([pet.id]);
    expect(await glucoseRepository.findById(reading.id)).not.toBeNull();
    // MMKV pointers rebuilt, onboarding not re-run
    expect(storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE)).toBe(true);
    expect(storage.getString(StorageKeys.ACTIVE_PET_ID)).toBe(pet.id);
    expect(storage.getString(StorageKeys.ACTIVE_SPECIES)).toBe('cat');
    expect(storage.getString(StorageKeys.HINTS_REGISTRATION_DATE)).toBeTruthy();
  });

  it('adopts even when created_at is in the future (restored onto a device with a lagging clock)', async () => {
    const pet = await petRepository.create({ name: 'Rex', species: 'dog', gender: 'male' });
    await agePet(pet.id, -6 * 60 * 60 * 1000); // created_at 6h in the future

    await runStartupRecovery();

    expect((await petRepository.findActive()).length).toBe(1);
    expect(storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE)).toBe(true);
    expect(storage.getString(StorageKeys.ACTIVE_SPECIES)).toBe('dog');
  });

  it('keeps ALL pets on adoption, including one created moments before the backup', async () => {
    const oldPet = await petRepository.create({ name: 'Old', species: 'cat', gender: 'male' });
    await agePet(oldPet.id, 90 * DAY_MS);
    const newPet = await petRepository.create({ name: 'New', species: 'dog', gender: 'female' });

    await runStartupRecovery();

    const pets = await petRepository.findActive();
    expect(pets.map(p => p.id).sort()).toEqual([oldPet.id, newPet.id].sort());
    // Oldest pet becomes active
    expect(storage.getString(StorageKeys.ACTIVE_PET_ID)).toBe(oldPet.id);
  });

  it('still purges a genuine onboarding orphan (pet created seconds ago)', async () => {
    const pet = await petRepository.create({ name: 'Orphan', species: 'cat', gender: 'male' });
    storage.set(StorageKeys.ACTIVE_PET_ID, pet.id);
    storage.set(StorageKeys.ACTIVE_SPECIES, 'cat');
    storage.set(vetNameKey(pet.id), 'Dr. Stranded');
    storage.set(vetNameKey('ghost-pet-id'), 'Dr. Ghost');

    await runStartupRecovery();

    expect(await petRepository.findActive()).toEqual([]);
    expect(storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE)).toBeUndefined();
    expect(storage.getString(StorageKeys.ACTIVE_PET_ID)).toBeUndefined();
    expect(storage.getString(StorageKeys.ACTIVE_SPECIES)).toBeUndefined();
    expect(storage.contains(vetNameKey(pet.id))).toBe(false);
    expect(storage.contains(vetNameKey('ghost-pet-id'))).toBe(false);
  });

  it('does nothing on a fresh install (empty DB, empty MMKV)', async () => {
    await runStartupRecovery();

    expect(await petRepository.findActive()).toEqual([]);
    expect(storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE)).toBeUndefined();
  });

  it('is a no-op when onboarding is complete, even with a freshly created pet', async () => {
    const pet = await petRepository.create({ name: 'Fresh', species: 'cat', gender: 'male' });
    storage.set(StorageKeys.ONBOARDING_COMPLETE, true);
    storage.set(StorageKeys.ACTIVE_PET_ID, pet.id);

    await runStartupRecovery();

    expect((await petRepository.findActive()).length).toBe(1);
    expect(storage.getString(StorageKeys.ACTIVE_PET_ID)).toBe(pet.id);
  });
});
