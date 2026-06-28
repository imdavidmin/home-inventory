<script lang="ts">
  import { onMount } from 'svelte';
  import AppMenu from './AppMenu.svelte';
  import { loadLocations } from '$lib/api';
  import { locations, sortedLocations } from '$lib/stores';
  import { navigateToLocation } from '$lib/inventory';
  import type { Location } from '$lib/types';
  import { plural } from '$lib/utils';

  function parentLabel(loc: Location): string {
    if (loc.parent_id == null) return '';
    return $locations.get(loc.parent_id)?.label ?? 'Location #' + loc.parent_id;
  }

  function summary(loc: Location): string {
    const items = loc.item_count ?? 0;
    const subs = loc.sublocation_count ?? 0;
    const itemPart = `${items} ${plural(items, 'item')}`;
    if (subs > 0) {
      return `${itemPart}, ${subs} ${plural(subs, 'sublocation')}`;
    }
    return itemPart;
  }

  function openLocation(id: number) {
    navigateToLocation(id);
  }

  onMount(() => {
    loadLocations().catch(() => {});
  });
</script>

<div class="locations-page">
  <header class="locations-header">
    <h1>Locations</h1>
    <AppMenu />
  </header>

  <main class="locations-main">
    {#if $sortedLocations.length === 0}
      <p class="empty">No locations yet.</p>
    {:else}
      <ul class="locations-grid">
        {#each $sortedLocations as loc (loc.id)}
          <li>
            <button
              type="button"
              class="location-card"
              class:location-card-nested={loc.parent_id != null}
              onclick={() => openLocation(loc.id)}
            >
              <span class="location-label">{loc.label}</span>
              {#if loc.parent_id != null}
                <span class="location-parent">in {parentLabel(loc)}</span>
              {/if}
              <span class="location-summary">{summary(loc)}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </main>
</div>

<style>
  .locations-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  .locations-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem 0.75rem;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border-light);
  }
  .locations-header h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .locations-main {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 0.75rem 1.25rem 1.25rem;
  }
  .empty {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.9rem;
  }
  .locations-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, 150px);
    gap: 0.5rem;
    justify-content: start;
    align-items: stretch;
  }
  .locations-grid > li {
    display: flex;
  }
  .location-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    width: 150px;
    flex: 1;
    min-height: 5.5rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius);
    background: var(--color-surface);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .location-card:hover {
    border-color: var(--color-border);
    background: #f8f9fb;
  }
  .location-card-nested {
    background: #eef1f6;
    border-color: #d5dbe3;
  }
  .location-card-nested:hover {
    background: #e4e9f0;
  }
  .location-label {
    font-weight: 500;
    font-size: 0.9rem;
    line-height: 1.3;
    word-break: break-word;
  }
  .location-parent {
    font-size: 0.75rem;
    color: var(--color-muted);
    line-height: 1.3;
    word-break: break-word;
  }
  .location-summary {
    margin-top: auto;
    font-size: 0.75rem;
    color: var(--color-muted);
    line-height: 1.3;
  }
</style>
