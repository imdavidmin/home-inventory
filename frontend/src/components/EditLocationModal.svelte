<script lang="ts">
  import Modal from './Modal.svelte';
  import LocationSelect from './LocationSelect.svelte';
  import type { Location, LocationPayload } from '$lib/types';

  interface Props {
    open?: boolean;
    location?: Location | null;
    locations?: Location[];
    onsubmit?: (payload: LocationPayload) => void;
    onclose?: () => void;
  }

  let { open = false, location = null, locations = [], onsubmit, onclose }: Props = $props();

  let label = $state('');
  let parentId = $state<number | ''>('');

  const parentOptions = $derived(
    location ? locations.filter((loc) => loc.id !== location.id) : locations
  );

  $effect(() => {
    if (open && location) {
      label = location.label ?? '';
      parentId = location.parent_id ?? '';
    }
  });

  function handleSubmit() {
    if (!label.trim()) return;
    onsubmit?.({
      label: label.trim(),
      parent_id: parentId === '' ? null : Number(parentId),
    });
  }
</script>

<Modal {open} title="Edit location" {onclose}>
  <label class="form-field">
    Label
    <input type="text" bind:value={label} required />
  </label>
  <LocationSelect
    locations={parentOptions}
    bind:value={parentId}
    label="Parent location"
    id="edit-location-parent"
    nullable
  />
  {#snippet actions()}
    <button type="button" onclick={onclose}>Cancel</button>
    <button type="button" onclick={handleSubmit}>Save</button>
  {/snippet}
</Modal>
