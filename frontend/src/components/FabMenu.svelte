<script lang="ts">
  interface Props {
    onadditems?: () => void;
    onnewlocation?: () => void;
  }

  let { onadditems, onnewlocation }: Props = $props();
  let open = $state(false);

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function addItems() {
    close();
    onadditems?.();
  }

  function newLocation() {
    close();
    onnewlocation?.();
  }
</script>

<svelte:window onclick={(event) => {
  if (open && !(event.target as Element).closest('.fab')) close();
}} />

<div class="fab">
  {#if open}
    <div class="fab-menu" role="menu">
      <button type="button" class="fab-menu-item" role="menuitem" onclick={addItems}>
        📦 Add items
      </button>
      <button type="button" class="fab-menu-item" role="menuitem" onclick={newLocation}>
        📍 New location
      </button>
    </div>
  {/if}
  <button
    type="button"
    class="fab-trigger"
    class:open
    aria-label={open ? 'Close menu' : 'Add'}
    aria-expanded={open}
    onclick={toggle}
  >
    +
  </button>
</div>

<style>
  .fab {
    position: fixed;
    right: 1.25rem;
    bottom: 1.25rem;
    z-index: 900;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.65rem;
  }

  .fab-trigger {
    width: 3.25rem;
    height: 3.25rem;
    border: none;
    border-radius: 999px;
    background: var(--color-accent);
    color: #fff;
    font-size: 1.75rem;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(14, 68, 145, 0.35);
    transition: transform 0.15s ease, background 0.15s ease;
  }

  .fab-trigger:hover {
    background: #0c3a7a;
  }

  .fab-trigger.open {
    transform: rotate(45deg);
  }

  .fab-menu {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.35rem;
    background: #fff;
    border: 1px solid #dde1e6;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    min-width: 10rem;
  }

  .fab-menu-item {
    padding: 0.55rem 0.85rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
  }

  .fab-menu-item:hover {
    background: var(--color-accent-light);
    color: var(--color-accent);
  }
</style>
