<script lang="ts">
  import Modal from './Modal.svelte';

  interface Props {
    open?: boolean;
    onsubmit?: (label: string) => void;
    onclose?: () => void;
  }

  let { open = false, onsubmit, onclose }: Props = $props();
  let label = $state('');

  $effect(() => {
    if (open) label = '';
  });

  function handleSubmit() {
    if (!label.trim()) return;
    onsubmit?.(label.trim());
  }
</script>

<Modal {open} title="New location" {onclose}>
  <label class="form-field">
    Label
    <input type="text" bind:value={label} required />
  </label>
  {#snippet actions()}
    <button type="button" onclick={onclose}>Cancel</button>
    <button type="button" onclick={handleSubmit}>Create</button>
  {/snippet}
</Modal>
