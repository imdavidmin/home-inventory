export const TAGS_PATH_RE = /^\/tags\/(\d+)\/?$/;

export function parseLocationIdFromPath(): number | null {
  const match = window.location.pathname.match(TAGS_PATH_RE);
  return match ? Number(match[1]) : null;
}

export function pathForLocation(id: number | null): string {
  return id == null ? '/' : '/tags/' + id;
}

export function navigateTo(id: number | null): void {
  const next = pathForLocation(id);
  if (window.location.pathname !== next) {
    history.pushState({ locationId: id }, '', next);
  }
}
