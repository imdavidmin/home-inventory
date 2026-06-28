<script lang="ts">
  import type { Location } from '$lib/types';

  interface Props {
    locations?: Location[];
    onselect?: (id: number) => void;
  }

  let { locations = [], onselect }: Props = $props();
</script>

{#if locations.length > 0}
  <div class="child-locations">
    {#each locations as loc (loc.id)}
      <button type="button" class="location-card" onclick={() => onselect?.(loc.id)}>
        {loc.label}
      </button>
    {/each}
  </div>
{/if}

<style>
  .child-locations {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
    margin-top: 0.75rem;
  }
  .location-card {
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--color-accent);
  }
  .location-card:hover {
    background: var(--color-accent-light);
    border-color: var(--color-accent);
  }
</style>
