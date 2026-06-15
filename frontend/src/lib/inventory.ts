import { get } from 'svelte/store';
import {
  createItem,
  createLocation,
  deleteItem,
  updateLocation,
  fetchAllItems,
  fetchLocationItems,
  itemToPayload,
  loadLocations,
  parseBulkLines,
  searchItems,
  updateItem,
} from './api';
import { navigateTo, parseLocationIdFromPath } from './routing';
import {
  closeModal,
  currentLocationId,
  rowData,
  searchQuery,
  searchScope,
  selectedItem,
  setStatus,
} from './stores';
import type { ItemRow, LocationPayload, NewItemPayload, SearchScope } from './types';
import { errorMessage, plural } from './utils';

function effectiveScope(locationId: number | null, scope: SearchScope): SearchScope {
  if (locationId == null && scope === 'location') return 'all';
  return scope;
}

function searchScopeLabel(
  searching: boolean,
  scope: SearchScope,
  locationId: number | null
): string {
  if (!searching) return '';
  if (scope === 'location' && locationId != null) return ' in this location';
  return ' everywhere';
}

export async function fetchGridData(
  locationId: number | null,
  query: string,
  scope: SearchScope
): Promise<ItemRow[]> {
  const trimmed = query.trim();
  if (trimmed) {
    let data = await searchItems(trimmed);
    if (scope === 'location' && locationId != null) {
      data = data.filter((item) => item.location_id === locationId);
    }
    return data;
  }

  if (locationId == null) return fetchAllItems();
  return fetchLocationItems(locationId);
}

export function itemCountLabel(
  count: number,
  searching: boolean,
  scope: SearchScope,
  locationId: number | null
): string {
  return `${count} ${plural(count, 'item')}${searchScopeLabel(searching, scope, locationId)}`;
}

export async function reloadGrid(locationId?: number | null): Promise<void> {
  const locId = locationId !== undefined ? locationId : get(currentLocationId);
  const query = get(searchQuery);
  let scope = effectiveScope(locId, get(searchScope));

  if (scope !== get(searchScope)) {
    searchScope.set(scope);
  }

  currentLocationId.set(locId);
  setStatus(query.trim() ? 'Searching…' : 'Loading…');

  try {
    const data = await fetchGridData(locId, query, scope);
    selectedItem.set(null);
    rowData.set(data);
    setStatus(itemCountLabel(data.length, query.trim().length > 0, scope, locId));
  } catch (err) {
    console.error(err);
    selectedItem.set(null);
    rowData.set([]);
    setStatus(errorMessage(err, 'Failed to load data'), true);
  }
}

type MutationOptions = {
  closeModal?: boolean;
  reloadLocations?: boolean;
  reloadGrid?: boolean;
};

async function withMutation(
  pendingMessage: string,
  action: () => Promise<void>,
  successMessage: string,
  errorFallback: string,
  options: MutationOptions = {}
): Promise<void> {
  const { closeModal: shouldClose = true, reloadLocations = true, reloadGrid: shouldReload = true } =
    options;

  if (shouldClose) closeModal();
  setStatus(pendingMessage);

  try {
    await action();
    if (reloadLocations) await loadLocations();
    if (shouldReload) await reloadGrid();
    setStatus(successMessage);
  } catch (err) {
    setStatus(errorMessage(err, errorFallback), true);
  }
}

export async function bootstrapApp(): Promise<void> {
  window.addEventListener('popstate', () => {
    reloadGrid(parseLocationIdFromPath());
  });

  setStatus('Loading locations…');
  try {
    await loadLocations();
    await reloadGrid(parseLocationIdFromPath());
  } catch (err) {
    setStatus(errorMessage(err, 'Failed to load locations'), true);
  }
}

export function navigateToLocation(id: number | null): void {
  navigateTo(id);
  reloadGrid(id);
}

export async function addItemsFromText(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    setStatus('Enter at least one item', true);
    return;
  }

  let items: NewItemPayload[];
  try {
    items = parseBulkLines(trimmed, get(currentLocationId));
  } catch (err) {
    setStatus(errorMessage(err, 'Invalid input'), true);
    return;
  }

  closeModal();
  setStatus(`Adding ${items.length} ${plural(items.length, 'item')}…`);

  const errors: string[] = [];
  let added = 0;
  for (const item of items) {
    try {
      await createItem(item);
      added++;
    } catch (err) {
      errors.push(item.label + ': ' + errorMessage(err, 'failed'));
    }
  }

  await loadLocations();
  await reloadGrid();

  if (errors.length === 0) {
    setStatus(`Added ${added} ${plural(added, 'item')}`);
  } else {
    setStatus(`Added ${added}, failed ${errors.length}: ${errors[0]}`, true);
  }
}

export async function editSelectedItem(payload: NewItemPayload): Promise<void> {
  const item = get(selectedItem);
  if (!item) return;

  await withMutation(
    'Saving…',
    () => updateItem(item.id, payload),
    'Item updated',
    'Failed to update item'
  );
}

export async function moveSelectedItem(newLocationId: number): Promise<void> {
  const item = get(selectedItem);
  if (!item) return;

  if (newLocationId === item.location_id) {
    closeModal();
    setStatus('Item is already in that location');
    return;
  }

  await withMutation(
    'Moving…',
    () => updateItem(item.id, itemToPayload(item, { location_id: newLocationId })),
    'Item moved',
    'Failed to move item'
  );
}

export async function deleteSelectedItem(): Promise<void> {
  const item = get(selectedItem);
  if (!item) return;
  if (!confirm('Delete "' + item.label + '"?')) return;

  await withMutation(
    'Deleting…',
    () => deleteItem(item.id),
    'Item deleted',
    'Failed to delete item',
    { closeModal: false, reloadLocations: false }
  );
}

export async function createLocationAndGo(payload: LocationPayload): Promise<void> {
  closeModal();
  setStatus('Creating location…');

  try {
    const created = await createLocation(payload);
    await loadLocations();
    setStatus('Created location "' + payload.label + '"');
    if (created?.id != null) {
      navigateToLocation(created.id);
    } else {
      await reloadGrid();
    }
  } catch (err) {
    setStatus(errorMessage(err, 'Failed to create location'), true);
  }
}

export async function editCurrentLocation(payload: LocationPayload): Promise<void> {
  const id = get(currentLocationId);
  if (id == null) return;

  await withMutation(
    'Saving…',
    () => updateLocation(id, payload),
    'Location updated',
    'Failed to update location'
  );
}
