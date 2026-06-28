export interface Location {
  id: number;
  label: string;
  parent_id?: number | null;
  item_count?: number;
  sublocation_count?: number;
}

export interface Item {
  id: number;
  label: string;
  location_id: number;
  tags: string | string[] | null;
  notes: string | null;
  quantity: number;
}

export interface ItemRow extends Item {
  tags: string[];
  location_label: string;
}

export interface NewItemPayload {
  label: string;
  location_id: number;
  quantity?: number;
  tags?: string[];
  notes?: string | null;
}

export interface BulkPreviewRow {
  label: string;
  location_label: string;
  quantity: number;
  notes: string | null;
}

export interface LocationItemsResponse {
  location: Location;
  items: Item[];
}

export type SearchScope = 'location' | 'all';

export interface LocationPayload {
  label: string;
  parent_id?: number | null;
}

export type ModalName = 'add' | 'edit' | 'move' | 'newLocation' | 'editLocation' | null;

declare global {
  interface Window {
    API_ENDPOINT: string;
  }
}

export {};
