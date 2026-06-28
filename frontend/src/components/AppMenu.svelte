<script lang="ts">
  import { appPage } from '$lib/stores';
  import { navigateToLocationsPage, pathForLocationsPage } from '$lib/routing';

  let open = $state(false);
  let menuEl = $state<HTMLDivElement | null>(null);

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function goToLocations(event: MouseEvent) {
    event.preventDefault();
    close();
    if ($appPage !== 'locations') {
      navigateToLocationsPage();
      appPage.set('locations');
    }
  }

  function handleWindowClick(event: MouseEvent) {
    if (open && menuEl && !menuEl.contains(event.target as Node)) {
      close();
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="app-menu" bind:this={menuEl}>
  <button
    type="button"
    class="menu-trigger"
    aria-label="Menu"
    aria-expanded={open}
    aria-haspopup="menu"
    onclick={toggle}
  >
    ☰
  </button>
  {#if open}
    <div class="menu-panel" role="menu">
      <a
        href={pathForLocationsPage()}
        class="menu-item"
        class:menu-item-active={$appPage === 'locations'}
        role="menuitem"
        onclick={goToLocations}
      >
        Locations
      </a>
    </div>
  {/if}
</div>

<style>
  .app-menu {
    position: relative;
    flex-shrink: 0;
  }
  .menu-trigger {
    padding: 0.35rem 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    font-size: 1.15rem;
    line-height: 1;
    cursor: pointer;
  }
  .menu-trigger:hover {
    background: #f2f4f8;
  }
  .menu-panel {
    position: absolute;
    top: calc(100% + 0.35rem);
    right: 0;
    min-width: 10rem;
    padding: 0.35rem 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    z-index: 100;
  }
  .menu-item {
    display: block;
    padding: 0.5rem 0.85rem;
    color: var(--color-text);
    text-decoration: none;
    font-size: 0.9rem;
  }
  .menu-item:hover,
  .menu-item-active {
    background: var(--color-accent-light);
    color: var(--color-accent-text);
  }
</style>
