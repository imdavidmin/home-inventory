<script lang="ts">
  import {
    currentLocationId,
    openModal,
    pageTitle,
    parentButtonTitle,
    searchQuery,
    searchScope,
    selectedItem,
    status,
  } from '$lib/stores';
  import { reloadGrid } from '$lib/inventory';

  interface Props {
    onsearchinput?: () => void;
    onparentclick?: () => void;
    ondelete?: () => void;
    onclearsearch?: () => void;
  }

  let { onsearchinput, onparentclick, ondelete, onclearsearch }: Props = $props();
</script>

<header class="toolbar">
  <div class="toolbar-row">
    <button
      type="button"
      title={$parentButtonTitle}
      disabled={$currentLocationId == null}
      onclick={onparentclick}
    >
      ↑ Parent
    </button>
    <h1>{$pageTitle}</h1>
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

  <p class="status" class:status-error={$status.error} aria-live="polite">{$status.message}</p>
</header>
