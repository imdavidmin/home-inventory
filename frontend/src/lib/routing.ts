export type AppPage = 'inventory' | 'locations';

export const TAGS_PATH_RE = /^\/tags\/(\d+)\/?$/;
export const LOCATIONS_PATH_RE = /^\/locations\/?$/;

export function parseLocationIdFromPath(pathname = window.location.pathname): number | null {
  const match = pathname.match(TAGS_PATH_RE);
  return match ? Number(match[1]) : null;
}

export function parseAppPage(pathname = window.location.pathname): AppPage {
  return LOCATIONS_PATH_RE.test(pathname) ? 'locations' : 'inventory';
}

export function parseAppRoute(pathname = window.location.pathname): {
  page: AppPage;
  locationId: number | null;
} {
  return {
    page: parseAppPage(pathname),
    locationId: parseLocationIdFromPath(pathname),
  };
}

export function pathForLocation(id: number | null): string {
  return id == null ? '/' : '/tags/' + id;
}

export function pathForLocationsPage(): string {
  return '/locations';
}

export function navigateTo(id: number | null): void {
  const next = pathForLocation(id);
  if (window.location.pathname !== next) {
    history.pushState({ page: 'inventory', locationId: id }, '', next);
  }
}

export function navigateToLocationsPage(): void {
  const next = pathForLocationsPage();
  if (window.location.pathname !== next) {
    history.pushState({ page: 'locations' }, '', next);
  }
}
