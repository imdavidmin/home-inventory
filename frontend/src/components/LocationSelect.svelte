<script lang="ts">
  import type { Location } from '$lib/types';

  interface Props {
    locations?: Location[];
    value?: number | '';
    label?: string;
    id?: string;
    nullable?: boolean;
    emptyLabel?: string;
  }

  let {
    locations = [],
    value = $bindable('' as number | ''),
    label = '',
    id,
    nullable = false,
    emptyLabel = 'None',
  }: Props = $props();
</script>

<label class="form-field" for={id}>
  {label}
  <select {id} bind:value>
    {#if nullable}
      <option value="">{emptyLabel}</option>
    {/if}
    {#each locations as loc (loc.id)}
      <option value={loc.id}>{loc.label}</option>
    {/each}
  </select>
</label>
