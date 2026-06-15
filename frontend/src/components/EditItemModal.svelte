<script lang="ts">
  import Modal from './Modal.svelte';
  import LocationSelect from './LocationSelect.svelte';
  import type { ItemRow, Location, NewItemPayload } from '$lib/types';
  import { tagsFromInputValue, tagsToInputValue } from '$lib/tags';

  interface Props {
    open?: boolean;
    item?: ItemRow | null;
    locations?: Location[];
    onsubmit?: (payload: NewItemPayload) => void;
    onclose?: () => void;
  }

  let { open = false, item = null, locations = [], onsubmit, onclose }: Props = $props();

  let label = $state('');
  let locationId = $state<number | ''>('');
  let quantity = $state(1);
  let tags = $state('');
  let notes = $state('');

  $effect(() => {
    if (open && item) {
      label = item.label ?? '';
      locationId = item.location_id;
      quantity = item.quantity ?? 1;
      tags = tagsToInputValue(item.tags);
      notes = item.notes ?? '';
    }
  });

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (!label.trim() || locationId === '') return;
    onsubmit?.({
      label: label.trim(),
      location_id: Number(locationId),
      quantity: Number(quantity),
      tags: tagsFromInputValue(tags),
      notes: notes.trim() || null,
    });
  }
</script>

<Modal {open} title="Edit item" {onclose}>
  <form class="form" onsubmit={handleSubmit}>
    <label class="form-field">
      Label
      <input type="text" bind:value={label} required />
    </label>
    <LocationSelect {locations} bind:value={locationId} label="Location" id="edit-location" />
    <label class="form-field">
      Quantity
      <input type="number" min="0" bind:value={quantity} />
    </label>
    <label class="form-field">
      Tags
      <input type="text" bind:value={tags} placeholder="tools, kitchen" />
    </label>
    <label class="form-field">
      Notes
      <textarea rows="3" bind:value={notes}></textarea>
    </label>
    {#snippet actions()}
      <button type="button" onclick={onclose}>Cancel</button>
      <button type="submit">Save</button>
    {/snippet}
  </form>
</Modal>
