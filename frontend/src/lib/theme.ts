export function getGridTheme() {
  const style = getComputedStyle(document.documentElement);
  const v = (name: string) => style.getPropertyValue(name).trim();

  return {
    accentColor: v('--color-accent'),
    backgroundColor: v('--color-surface'),
    foregroundColor: v('--color-text'),
    headerBackgroundColor: v('--color-bg'),
    borderColor: v('--color-border-light'),
    borderRadius: 6,
    spacing: 8,
    fontSize: 14,
    headerFontSize: 13,
    wrapperBorder: true,
  };
}
