<script lang="ts">
  import type { Location } from '$lib/types';

  interface Props {
    locations?: Location[];
    value?: number | '';
    label?: string;
    id?: string;
  }

  let {
    locations = [],
    value = $bindable('' as number | ''),
    label = '',
    id,
  }: Props = $props();
</script>

<label class="form-field" for={id}>
  {label}
  <select {id} bind:value>
    {#each locations as loc (loc.id)}
      <option value={loc.id}>{loc.label}</option>
    {/each}
  </select>
</label>
