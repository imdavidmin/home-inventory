export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function plural(count: number, singular: string, pluralForm = singular + 's'): string {
  return count === 1 ? singular : pluralForm;
}
