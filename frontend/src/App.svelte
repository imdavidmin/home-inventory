<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import Toolbar from './components/Toolbar.svelte';
  import ItemGrid from './components/ItemGrid.svelte';
  import FabMenu from './components/FabMenu.svelte';
  import AddItemsModal from './components/AddItemsModal.svelte';
  import EditItemModal from './components/EditItemModal.svelte';
  import MoveItemModal from './components/MoveItemModal.svelte';
  import NewLocationModal from './components/NewLocationModal.svelte';
  import {
    activeModal,
    closeModal,
    openModal,
    parentLocationId,
    rowData,
    searchQuery,
    selectedItem,
    sortedLocations,
  } from '$lib/stores';
  import {
    addItemsFromText,
    bootstrapApp,
    createLocationAndGo,
    deleteSelectedItem,
    editSelectedItem,
    moveSelectedItem,
    navigateToLocation,
    reloadGrid,
  } from '$lib/inventory';

  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => reloadGrid(), 250);
  }

  function clearSearch() {
    searchQuery.set('');
    reloadGrid();
  }

  function onParentClick() {
    navigateToLocation(get(parentLocationId));
  }

  onMount(() => bootstrapApp());
</script>

<Toolbar
  onsearchinput={onSearchInput}
  onparentclick={onParentClick}
  ondelete={deleteSelectedItem}
  onclearsearch={clearSearch}
/>

<main class="app-main">
  <ItemGrid
    rowData={$rowData}
    onselect={(item) => selectedItem.set(item)}
    onlocationclick={navigateToLocation}
  />
</main>

<AddItemsModal
  open={$activeModal === 'add'}
  onclose={closeModal}
  onsubmit={addItemsFromText}
/>

<EditItemModal
  open={$activeModal === 'edit'}
  item={$selectedItem}
  locations={$sortedLocations}
  onclose={closeModal}
  onsubmit={editSelectedItem}
/>

<MoveItemModal
  open={$activeModal === 'move'}
  item={$selectedItem}
  locations={$sortedLocations}
  onclose={closeModal}
  onsubmit={moveSelectedItem}
/>

<NewLocationModal
  open={$activeModal === 'newLocation'}
  onclose={closeModal}
  onsubmit={createLocationAndGo}
/>

<FabMenu onadditems={() => openModal('add')} onnewlocation={() => openModal('newLocation')} />
