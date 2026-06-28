<script lang="ts">
  import { createGrid, themeQuartz } from 'ag-grid-community';
  import type { ColDef, GridApi } from 'ag-grid-community';
  import { get } from 'svelte/store';
  import { _ } from 'svelte-i18n';
  import { getGridTheme } from '$lib/theme';
  import type { BulkPreviewRow } from '$lib/types';
  import { formatQuantity } from '$lib/tags';

  interface Props {
    rowData?: BulkPreviewRow[];
  }

  let { rowData = [] }: Props = $props();

  let gridEl = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<BulkPreviewRow> | null>(null);

  $effect(() => {
    if (!gridEl) return;

    const t = get(_);
    const columnDefs: ColDef<BulkPreviewRow>[] = [
      {
        field: 'label',
        headerName: t('grid.label'),
        flex: 1,
        minWidth: 140,
      },
      {
        field: 'location_label',
        headerName: t('grid.location'),
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'quantity',
        headerName: t('grid.quantity'),
        width: 90,
        valueFormatter: (params) => formatQuantity(params.value),
      },
      {
        field: 'notes',
        headerName: t('grid.notes'),
        flex: 1,
        minWidth: 140,
      },
    ];

    const api = createGrid(gridEl, {
      theme: themeQuartz.withParams(getGridTheme()),
      columnDefs,
      rowData: [],
      defaultColDef: {
        sortable: true,
        resizable: true,
      },
      animateRows: true,
      onFirstDataRendered: () => {
        api.sizeColumnsToFit();
      },
    });

    gridApi = api;

    return () => {
      api.destroy();
      gridApi = null;
    };
  });

  $effect(() => {
    if (!gridApi) return;
    gridApi.setGridOption('rowData', [...rowData]);
  });
</script>

<div class="grid" bind:this={gridEl}></div>

<style>
  .grid {
    width: 100%;
    height: min(50vh, 20rem);
    min-height: 10rem;
  }
</style>
