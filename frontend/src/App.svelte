<script lang="ts">
  import { onMount } from 'svelte';
  import Toolbar from './components/Toolbar.svelte';
  import ItemGrid from './components/ItemGrid.svelte';
  import FabMenu from './components/FabMenu.svelte';
  import ToastStack from './components/ToastStack.svelte';
  import AddItemsModal from './components/AddItemsModal.svelte';
  import EditItemModal from './components/EditItemModal.svelte';
  import MoveItemModal from './components/MoveItemModal.svelte';
  import NewLocationModal from './components/NewLocationModal.svelte';
  import EditLocationModal from './components/EditLocationModal.svelte';
  import {
    activeModal,
    closeModal,
    currentLocation,
    currentLocationId,
    openModal,
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
    editCurrentLocation,
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

  onMount(() => bootstrapApp());
</script>

<div class="app-shell">
  <Toolbar onsearchinput={onSearchInput} ondelete={deleteSelectedItem} onclearsearch={clearSearch} />

  <main class="app-main">
    <ItemGrid
      rowData={$rowData}
      onselect={(item) => selectedItem.set(item)}
      onlocationclick={navigateToLocation}
    />
  </main>
</div>

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
  locations={$sortedLocations}
  defaultParentId={$currentLocationId}
  onclose={closeModal}
  onsubmit={createLocationAndGo}
/>

<EditLocationModal
  open={$activeModal === 'editLocation'}
  location={$currentLocation}
  locations={$sortedLocations}
  onclose={closeModal}
  onsubmit={editCurrentLocation}
/>

<FabMenu onadditems={() => openModal('add')} onnewlocation={() => openModal('newLocation')} />

<ToastStack />
