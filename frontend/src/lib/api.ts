import { get } from 'svelte/store';
import type {
  BulkPreviewRow,
  Item,
  ItemRow,
  Location,
  LocationItemsResponse,
  LocationPayload,
  NewItemPayload,
} from './types';
import { normalizeTags, tagsToApiString } from './tags';
import { locations } from './stores';

function apiBase(): string {
  return window.API_ENDPOINT.replace(/\/$/, '');
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T | null> {
  const options: RequestInit = { method, headers: {} };
  if (body !== undefined) {
    (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(apiBase() + path, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(res.status + ' ' + res.statusText + (text ? ': ' + text : ''));
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}

export async function loadLocations(): Promise<Map<number, Location>> {
  const list = (await apiRequest<Location[]>('GET', '/locations')) ?? [];
  const map = new Map(list.map((loc) => [loc.id, loc]));
  locations.set(map);
  return map;
}

export function itemToPayload(
  item: ItemRow,
  overrides?: Partial<NewItemPayload>
): NewItemPayload {
  return {
    label: item.label,
    location_id: item.location_id,
    quantity: item.quantity ?? 1,
    tags: item.tags,
    notes: item.notes,
    ...overrides,
  };
}

export function enrichItems(items: Item[]): ItemRow[] {
  const locs = get(locations);
  return items.map((item) => {
    const location = locs.get(item.location_id);
    const row = item as ItemRow;
    return {
      ...item,
      tags: normalizeTags(item.tags),
      location_label:
        location?.label ?? row.location_label ?? String(item.location_id ?? ''),
    };
  });
}

export async function fetchAllItems(): Promise<ItemRow[]> {
  return enrichItems((await apiRequest<Item[]>('GET', '/items')) ?? []);
}

export async function fetchLocationItems(locationId: number): Promise<ItemRow[]> {
  const data = await apiRequest<LocationItemsResponse>(
    'GET',
    '/locations/' + locationId + '/items'
  );
  if (data?.location?.id != null) {
    locations.update((m) => {
      const next = new Map(m);
      next.set(data.location.id, data.location);
      return next;
    });
  }
  return enrichItems(data?.items ?? []);
}

export async function searchItems(query: string): Promise<ItemRow[]> {
  return enrichItems(
    (await apiRequest<Item[]>('GET', '/items/search?q=' + encodeURIComponent(query))) ?? []
  );
}

function itemToApiBody(item: NewItemPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    label: item.label,
    location_id: item.location_id,
    quantity: item.quantity ?? 1,
  };
  const tags = tagsToApiString(item.tags);
  if (tags !== undefined) body.tags = tags;
  if (item.notes != null && item.notes !== '') body.notes = item.notes;
  return body;
}

export async function createItem(item: NewItemPayload): Promise<void> {
  await apiRequest('POST', '/items', itemToApiBody(item));
}

export async function updateItem(id: number, item: NewItemPayload): Promise<void> {
  await apiRequest('PUT', '/items/' + id, itemToApiBody(item));
}

export async function deleteItem(id: number): Promise<void> {
  await apiRequest('DELETE', '/items/' + id);
}

function locationToApiBody(payload: LocationPayload): Record<string, unknown> {
  const body: Record<string, unknown> = { label: payload.label.trim() };
  if ('parent_id' in payload) body.parent_id = payload.parent_id;
  return body;
}

export async function createLocation(payload: LocationPayload): Promise<Location | null> {
  return apiRequest<Location>('POST', '/locations', locationToApiBody(payload));
}

export async function updateLocation(
  id: number,
  payload: LocationPayload
): Promise<Location | null> {
  return apiRequest<Location>('PUT', '/locations/' + id, locationToApiBody(payload));
}

function labelsMatch(input: string, stored: string): boolean {
  return input.trim().localeCompare(stored.trim(), undefined, { sensitivity: 'base' }) === 0;
}

function parseLocationId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export function resolveLocationByLabel(label: string): number {
  const trimmed = label.trim();
  const locs = get(locations);

  const id = parseLocationId(trimmed);
  if (id != null && locs.has(id)) {
    return id;
  }

  const matches = [...locs.values()].filter((loc) => labelsMatch(trimmed, loc.label));
  if (matches.length === 1) return matches[0].id;
  if (matches.length > 1) throw new Error('Ambiguous location "' + label + '"');
  throw new Error('Unknown location "' + label + '"');
}

export function splitBulkFields(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  if (inQuotes) {
    throw new Error('unclosed quote');
  }

  fields.push(current.trim());
  return fields;
}

/** Strip tabs from comma-separated lines; tabs are not field separators. */
function prepareBulkLine(line: string): string {
  return line.includes(',') ? line.replace(/\t/g, '') : line;
}

export function parseBulkLines(
  text: string,
  currentLocationId: number | null
): NewItemPayload[] {
  const lines = text.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const parsed: NewItemPayload[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    let parts: string[];
    try {
      parts = splitBulkFields(prepareBulkLine(lines[i]));
    } catch {
      throw new Error('Line ' + lineNum + ': unclosed quote in label or location');
    }

    if (parts.length === 1 && currentLocationId != null) {
      if (!parts[0]) throw new Error('Line ' + lineNum + ': missing label');
      parsed.push({ label: parts[0], location_id: currentLocationId, quantity: 1 });
      continue;
    }

    if (parts.length < 2 || parts.length > 4) {
      throw new Error('Line ' + lineNum + ': expected label, location [, quantity [, notes]]');
    }

    const itemLabel = parts[0];
    const locationLabel = parts[1];
    if (!itemLabel) throw new Error('Line ' + lineNum + ': missing label');
    if (!locationLabel) throw new Error('Line ' + lineNum + ': missing location');

    let quantity = 1;
    if (parts.length >= 3) {
      quantity = Number(parts[2]);
      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new Error('Line ' + lineNum + ': invalid quantity');
      }
    }

    const notes = parts.length === 4 && parts[3] ? parts[3] : null;

    parsed.push({
      label: itemLabel,
      location_id: resolveLocationByLabel(locationLabel),
      quantity,
      notes,
    });
  }

  return parsed;
}

export function bulkItemsToPreviewRows(items: NewItemPayload[]): BulkPreviewRow[] {
  const locs = get(locations);
  return items.map((item) => ({
    label: item.label,
    location_label: locs.get(item.location_id)?.label ?? String(item.location_id),
    quantity: item.quantity ?? 1,
    notes: item.notes ?? null,
  }));
}
