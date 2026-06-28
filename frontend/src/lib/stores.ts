import { writable, derived } from 'svelte/store';
import type { ItemRow, Location, ModalName, SearchScope } from './types';

export interface Toast {
  id: number;
  message: string;
  error: boolean;
}

export const locations = writable<Map<number, Location>>(new Map());
export const currentLocationId = writable<number | null>(null);
export const selectedItem = writable<ItemRow | null>(null);
export const rowData = writable<ItemRow[]>([]);
export const searchQuery = writable('');
export const searchScope = writable<SearchScope>('all');
export const toasts = writable<Toast[]>([]);
export const activeModal = writable<ModalName>(null);

let nextToastId = 0;

export const sortedLocations = derived(locations, ($locs) =>
  [...$locs.values()].sort((a, b) => a.label.localeCompare(b.label))
);

export interface BreadcrumbCrumb {
  id: number | null;
  label: string;
}

export const locationBreadcrumb = derived([locations, currentLocationId], ([$locs, $id]) => {
  const crumbs: BreadcrumbCrumb[] = [{ id: null, label: 'All locations' }];
  if ($id == null) return crumbs;

  const chain: Location[] = [];
  let current = $locs.get($id);
  while (current) {
    chain.unshift(current);
    current =
      current.parent_id != null ? ($locs.get(current.parent_id) ?? undefined) : undefined;
  }

  for (const loc of chain) {
    crumbs.push({ id: loc.id, label: loc.label });
  }
  return crumbs;
});

export const childLocations = derived([locations, currentLocationId], ([$locs, $id]) =>
  [...$locs.values()]
    .filter((loc) => ($id == null ? loc.parent_id == null : loc.parent_id === $id))
    .sort((a, b) => a.label.localeCompare(b.label))
);

export const currentLocationLabel = derived([locations, currentLocationId], ([$locs, $id]) => {
  if ($id == null) return null;
  return $locs.get($id)?.label ?? null;
});

export const currentLocation = derived([locations, currentLocationId], ([$locs, $id]) => {
  if ($id == null) return null;
  return $locs.get($id) ?? null;
});

export function pushToast(message: string, error = false): void {
  const trimmed = message.trim();
  if (!trimmed) return;
  const id = ++nextToastId;
  toasts.update((list) => [...list, { id, message: trimmed, error }]);
}

export function dismissToast(id: number): void {
  toasts.update((list) => list.filter((toast) => toast.id !== id));
}

export function setStatus(message: string, error = false) {
  pushToast(message, error);
}

export function openModal(name: NonNullable<ModalName>) {
  activeModal.set(name);
}

export function closeModal() {
  activeModal.set(null);
}
