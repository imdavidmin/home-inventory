import { writable, derived } from 'svelte/store';
import type { ItemRow, Location, ModalName, SearchScope } from './types';

export const locations = writable<Map<number, Location>>(new Map());
export const currentLocationId = writable<number | null>(null);
export const selectedItem = writable<ItemRow | null>(null);
export const rowData = writable<ItemRow[]>([]);
export const searchQuery = writable('');
export const searchScope = writable<SearchScope>('all');
export const status = writable<{ message: string; error: boolean }>({ message: '', error: false });
export const activeModal = writable<ModalName>(null);

export const sortedLocations = derived(locations, ($locs) =>
  [...$locs.values()].sort((a, b) => a.label.localeCompare(b.label))
);

export const parentLocationId = derived([locations, currentLocationId], ([$locs, $id]) => {
  if ($id == null) return null;
  return $locs.get($id)?.parent_id ?? null;
});

export const pageTitle = derived([locations, currentLocationId], ([$locs, $id]) => {
  if ($id == null) return 'All locations';
  const loc = $locs.get($id);
  return loc ? loc.label : 'Location #' + $id;
});

export const parentButtonTitle = derived(
  [locations, currentLocationId, parentLocationId],
  ([$locs, $id, $parentId]) => {
    if ($id == null) return 'Already viewing all locations';
    if ($parentId != null) {
      const parent = $locs.get($parentId);
      return parent ? 'Go to parent: ' + parent.label : 'Go to parent location';
    }
    return 'Go to all locations';
  }
);

export const currentLocationLabel = derived([locations, currentLocationId], ([$locs, $id]) => {
  if ($id == null) return null;
  return $locs.get($id)?.label ?? null;
});

export function setStatus(message: string, error = false) {
  status.set({ message, error });
}

export function openModal(name: NonNullable<ModalName>) {
  activeModal.set(name);
}

export function closeModal() {
  activeModal.set(null);
}
