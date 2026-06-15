<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    title?: string;
    onclose?: () => void;
    children?: Snippet;
    actions?: Snippet;
  }

  let { open = false, title = '', onclose, children, actions }: Props = $props();

  function backdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) onclose?.();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={backdropClick} role="presentation">
    <div class="modal" role="dialog" aria-labelledby="modal-title">
      <h2 id="modal-title">{title}</h2>
      {@render children?.()}
      <div class="actions">
        {@render actions?.()}
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 1000;
  }
  .modal {
    background: #fff;
    border-radius: 8px;
    padding: 1.25rem;
    width: min(100%, 28rem);
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
  .modal h2 {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }
</style>
