<script lang="ts">
  import AppMenu from './AppMenu.svelte';
  import ChildLocationCards from './ChildLocationCards.svelte';
  import {
    childLocations,
    currentLocationId,
    locationBreadcrumb,
    openModal,
    searchQuery,
    searchScope,
    selectedItem,
  } from '$lib/stores';
  import { navigateToLocation, reloadGrid } from '$lib/inventory';
  import { pathForLocation } from '$lib/routing';

  interface Props {
    onsearchinput?: () => void;
    ondelete?: () => void;
    onclearsearch?: () => void;
  }

  let { onsearchinput, ondelete, onclearsearch }: Props = $props();

  const crumbs = $derived($locationBreadcrumb);
  const showChildLocations = $derived(!$searchQuery.trim());

  function breadcrumbNavigate(event: MouseEvent, id: number | null) {
    event.preventDefault();
    navigateToLocation(id);
  }
</script>

<header class="toolbar">
  <div class="toolbar-top">
    <nav class="breadcrumb" aria-label="Location">
    {#each crumbs as crumb, index (crumb.id ?? 'root')}
      {#if index > 0}
        <span class="breadcrumb-sep" aria-hidden="true">/</span>
      {/if}
      {#if index === crumbs.length - 1}
        <span class="breadcrumb-current" aria-current="page">
          {#if crumb.id == null}
            <span aria-label="All locations">🏠</span>
          {:else}
            {crumb.label}
          {/if}
        </span>
      {:else}
        <a
          href={pathForLocation(crumb.id)}
          class="breadcrumb-link"
          onclick={(event) => breadcrumbNavigate(event, crumb.id)}
        >
          {#if crumb.id == null}
            <span aria-label="All locations">🏠</span>
          {:else}
            {crumb.label}
          {/if}
        </a>
      {/if}
    {/each}
    {#if $currentLocationId != null}
      <button
        type="button"
        class="btn-icon breadcrumb-edit"
        title="Edit location"
        onclick={() => openModal('editLocation')}
      >
        ✏️
      </button>
    {/if}
    </nav>
    <AppMenu />
  </div>

  <div class="toolbar-row search-row">
    <input
      type="search"
      placeholder="Search items…"
      autocomplete="off"
      value={$searchQuery}
      oninput={(event) => {
        searchQuery.set(event.currentTarget.value);
        onsearchinput?.();
      }}
    />
    <label class="scope-label" for="search-scope">Search in</label>
    <select
      id="search-scope"
      value={$searchScope}
      disabled={$currentLocationId == null}
      onchange={(event) => {
        searchScope.set(event.currentTarget.value as 'location' | 'all');
        reloadGrid();
      }}
    >
      <option value="location">This location</option>
      <option value="all">All locations</option>
    </select>
    {#if $searchQuery.trim()}
      <button type="button" onclick={onclearsearch}>Clear</button>
    {/if}
  </div>

  {#if showChildLocations}
    <ChildLocationCards locations={$childLocations} onselect={navigateToLocation} />
  {/if}

  <div class="toolbar-row action-bar">
    <button type="button" disabled={!$selectedItem} onclick={() => openModal('edit')}>
      ✏️ Edit
    </button>
    <button type="button" disabled={!$selectedItem} onclick={() => openModal('move')}>
      ➡️ Move
    </button>
    <button type="button" class="btn-danger" disabled={!$selectedItem} onclick={ondelete}>
      🗑️ Delete
    </button>
  </div>
</header>
