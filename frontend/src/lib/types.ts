export interface Location {
  id: number;
  label: string;
  parent_id?: number | null;
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

export interface LocationItemsResponse {
  location: Location;
  items: Item[];
}

export type SearchScope = 'location' | 'all';

export type ModalName = 'add' | 'edit' | 'move' | 'newLocation' | null;

declare global {
  interface Window {
    API_ENDPOINT: string;
  }
}

export {};
