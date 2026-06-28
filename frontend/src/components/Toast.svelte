<script lang="ts">
  import { onMount } from 'svelte';
  import type { Toast as ToastData } from '$lib/stores';

  interface Props {
    toast: ToastData;
    ondismiss?: () => void;
  }

  let { toast, ondismiss }: Props = $props();

  onMount(() => {
    const timer = setTimeout(() => ondismiss?.(), 5000);
    return () => clearTimeout(timer);
  });
</script>

<div class="toast" class:toast-error={toast.error} role="status">
  <button type="button" class="toast-close" aria-label="Dismiss" onclick={() => ondismiss?.()}>
    ×
  </button>
  <p>{toast.message}</p>
</div>

<style>
  .toast {
    position: relative;
    padding: 0.65rem 2rem 0.65rem 0.85rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    font-size: 0.875rem;
    color: var(--color-text);
    max-width: min(22rem, calc(100vw - 2rem));
  }
  .toast-error {
    border-color: var(--color-danger-border);
    color: var(--color-danger);
  }
  .toast p {
    margin: 0;
    line-height: 1.4;
  }
  .toast-close {
    position: absolute;
    top: 0.25rem;
    right: 0.35rem;
    padding: 0.1rem 0.35rem;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    line-height: 1;
    color: var(--color-muted);
    cursor: pointer;
    border-radius: 4px;
  }
  .toast-close:hover {
    color: var(--color-text);
    background: #f2f4f8;
  }
</style>
