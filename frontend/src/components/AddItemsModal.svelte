<script lang="ts">
  import Modal from './Modal.svelte';
  import { currentLocationLabel } from '$lib/stores';

  interface Props {
    open?: boolean;
    onsubmit?: (text: string) => void;
    onclose?: () => void;
  }

  let { open = false, onsubmit, onclose }: Props = $props();
  let text = $state('');

  function handleSubmit() {
    onsubmit?.(text);
  }

  $effect(() => {
    if (open) text = '';
  });
</script>

<Modal {open} title="Add items" {onclose}>
  <p class="hint">
    One item per line: <code>label, location</code> or
    <code>label, location, quantity</code>. Quantity defaults to 1.
    {#if $currentLocationLabel}
      A single word adds to <strong>{$currentLocationLabel}</strong>.
    {:else}
      On a location page, a single word adds to the current location.
    {/if}
  </p>
  <label class="form-field">
    Items
    <textarea bind:value={text} rows="8" placeholder="29mm wrench, Gousto box&#10;hammer, Kitchen, 2"></textarea>
  </label>
  {#snippet actions()}
    <button type="button" onclick={onclose}>Cancel</button>
    <button type="button" onclick={handleSubmit}>Add</button>
  {/snippet}
</Modal>

<style>
  .hint {
    margin: 0 0 0.75rem;
    font-size: 0.85rem;
    color: #525252;
    line-height: 1.4;
  }
  .hint code {
    font-size: 0.8rem;
    background: #f2f4f8;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }
</style>
