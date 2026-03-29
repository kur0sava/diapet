/**
 * Centralized React Query key factory.
 * Use `.all` for invalidation (prefix matching) and specific keys for queries.
 */
export const queryKeys = {
  glucose: {
    all: ['glucose'] as const,
    latest: (petId: string) => ['glucose', 'latest', petId] as const,
    days7: (petId: string) => ['glucose', '7days', petId] as const,
    last7: (petId: string) => ['glucose', 'last7', petId] as const,
    list: (petId: string, filters: unknown) => ['glucose', 'list', petId, filters] as const,
    stats: (petId: string) => ['glucose', 'stats', petId] as const,
  },
  injections: {
    all: ['injections'] as const,
    latest: (petId: string) => ['injections', 'latest', petId] as const,
    list: (petId: string) => ['injections', petId] as const,
  },
  feedings: {
    all: ['feedings'] as const,
    list: (petId: string) => ['feedings', petId] as const,
  },
  schedule: {
    all: ['schedule'] as const,
    injections: (petId: string) => ['schedule', 'injections', petId] as const,
    feedings: (petId: string) => ['schedule', 'feedings', petId] as const,
  },
  symptoms: {
    all: ['symptoms'] as const,
    list: (petId: string) => ['symptoms', petId] as const,
    detail: (id: string) => ['symptom', id] as const,
    recentGlucose: (petId: string) => ['recentGlucose', petId] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    list: (petId: string, year: number, month: number) => ['expenses', petId, year, month] as const,
    total: (petId: string, year: number, month: number) => ['expenses', 'total', petId, year, month] as const,
  },
  diary: {
    all: ['diary'] as const,
    glucose: (petId: string, date: string) => ['diary', 'glucose', petId, date] as const,
    injection: (petId: string, date: string) => ['diary', 'injection', petId, date] as const,
    feeding: (petId: string, date: string) => ['diary', 'feeding', petId, date] as const,
  },
};
