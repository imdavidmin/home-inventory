<script lang="ts">
  import Modal from './Modal.svelte';
  import LocationSelect from './LocationSelect.svelte';
  import type { ItemRow, Location } from '$lib/types';

  interface Props {
    open?: boolean;
    item?: ItemRow | null;
    locations?: Location[];
    onsubmit?: (locationId: number) => void;
    onclose?: () => void;
  }

  let { open = false, item = null, locations = [], onsubmit, onclose }: Props = $props();
  let locationId = $state<number | ''>('');

  $effect(() => {
    if (open && item) locationId = item.location_id;
  });

  function handleSubmit() {
    if (locationId === '') return;
    onsubmit?.(Number(locationId));
  }
</script>

<Modal {open} title="Move item" {onclose}>
  {#if item}
    <p class="item-name">{item.label}</p>
  {/if}
  <LocationSelect
    {locations}
    bind:value={locationId}
    label="New location"
    id="move-location"
  />
  {#snippet actions()}
    <button type="button" onclick={onclose}>Cancel</button>
    <button type="button" onclick={handleSubmit}>Move</button>
  {/snippet}
</Modal>

<style>
  .item-name {
    margin: 0 0 0.75rem;
    font-weight: 500;
  }
</style>
