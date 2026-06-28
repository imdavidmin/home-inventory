<script lang="ts">
  import { dismissToast, toasts } from '$lib/stores';
  import Toast from './Toast.svelte';
</script>

<div class="toast-stack" aria-live="polite">
  {#each $toasts as toast (toast.id)}
    <Toast {toast} ondismiss={() => dismissToast(toast.id)} />
  {/each}
</div>

<style>
  .toast-stack {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
  }
  .toast-stack :global(.toast) {
    pointer-events: auto;
  }
</style>
