<script lang="ts">
  import Modal from './Modal.svelte';
  import BulkPreviewGrid from './BulkPreviewGrid.svelte';
  import { bulkItemsToPreviewRows, parseBulkLines } from '$lib/api';
  import { currentLocationId, currentLocationLabel } from '$lib/stores';
  import type { BulkPreviewRow, NewItemPayload } from '$lib/types';
  import { _ } from 'svelte-i18n';
  import { get } from 'svelte/store';

  interface Props {
    open?: boolean;
    onsubmit?: (items: NewItemPayload[]) => void;
    onclose?: () => void;
  }

  let { open = false, onsubmit, onclose }: Props = $props();
  let text = $state('');
  let step = $state<'input' | 'preview'>('input');
  let previewItems = $state<NewItemPayload[]>([]);
  let previewRows = $state<BulkPreviewRow[]>([]);
  let parseError = $state('');

  function reset() {
    text = '';
    step = 'input';
    previewItems = [];
    previewRows = [];
    parseError = '';
  }

  function handlePreview() {
    parseError = '';
    const trimmed = text.trim();
    if (!trimmed) {
      parseError = get(_)('addItems.emptyError');
      return;
    }

    try {
      previewItems = parseBulkLines(trimmed, get(currentLocationId));
      previewRows = bulkItemsToPreviewRows(previewItems);
      step = 'preview';
    } catch (err) {
      parseError = err instanceof Error ? err.message : 'Invalid input';
    }
  }

  function handleBack() {
    step = 'input';
    parseError = '';
  }

  function handleConfirm() {
    onsubmit?.(previewItems);
  }

  $effect(() => {
    if (open) reset();
  });
</script>

<Modal
  {open}
  wide={step === 'preview'}
  title={step === 'preview' ? $_('addItems.previewTitle') : $_('addItems.title')}
  {onclose}
>
  {#if step === 'input'}
    <p class="hint">
      {$_('addItems.hintIntro')}
      <code>{$_('addItems.hintFormatShort')}</code>,
      <code>{$_('addItems.hintFormatFull')}</code>, or
      <code>{$_('addItems.hintFormatNotes')}</code>.
      {$_('addItems.hintQuantityDefault')}
      {$_('addItems.hintQuotes')}
      <code>{$_('addItems.hintQuoteExample')}</code>.
      {$_('addItems.hintLocationMatch')}
      {#if $currentLocationLabel}
        {$_('addItems.hintCurrentLocation', { values: { location: $currentLocationLabel } })}
      {:else}
        {$_('addItems.hintCurrentLocationFallback')}
      {/if}
    </p>
    <label class="form-field">
      {$_('addItems.itemsLabel')}
      <textarea
        bind:value={text}
        rows="8"
        placeholder={$_('addItems.placeholder')}
      ></textarea>
    </label>
    {#if parseError}
      <p class="error">{parseError}</p>
    {/if}
  {:else}
    <p class="hint">{$_('addItems.previewHint')}</p>
    <BulkPreviewGrid rowData={previewRows} />
  {/if}
  {#snippet actions()}
    {#if step === 'input'}
      <button type="button" onclick={onclose}>{$_('addItems.cancel')}</button>
      <button type="button" onclick={handlePreview}>{$_('addItems.preview')}</button>
    {:else}
      <button type="button" onclick={handleBack}>{$_('addItems.back')}</button>
      <button type="button" onclick={onclose}>{$_('addItems.cancel')}</button>
      <button type="button" onclick={handleConfirm}>
        {$_('addItems.confirm', { values: { count: previewItems.length } })}
      </button>
    {/if}
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
  .error {
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
    color: #b42318;
  }
</style>
