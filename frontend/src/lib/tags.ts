export function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof tags === 'string' && tags.trim()) {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
  }
  return [];
}

export function tagsToApiString(tags: unknown): string | undefined {
  const normalized = normalizeTags(tags);
  return normalized.length > 0 ? JSON.stringify(normalized) : undefined;
}

export function tagsToInputValue(tags: unknown): string {
  return normalizeTags(tags).join(', ');
}

export function tagsFromInputValue(text: string): string[] {
  return normalizeTags(text.split(','));
}

export function formatQuantity(value: number | null | undefined): string {
  if (value === -1) return '--';
  if (value == null) return '';
  return String(value);
}
