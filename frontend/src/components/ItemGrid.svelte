<script lang="ts">
  import { createGrid, themeQuartz } from 'ag-grid-community';
  import type { GridApi } from 'ag-grid-community';
  import { buildColumnDefs } from '$lib/grid';
  import { getGridTheme } from '$lib/theme';
  import type { ItemRow } from '$lib/types';

  interface Props {
    rowData?: ItemRow[];
    onselect?: (item: ItemRow | null) => void;
    onlocationclick?: (locationId: number) => void;
  }

  let { rowData = [], onselect, onlocationclick }: Props = $props();

  let gridEl = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<ItemRow> | null>(null);

  // ag-grid captures callbacks at init; mirror props here so handlers stay current.
  const handlers = {
    onselect: undefined as Props['onselect'],
    onlocationclick: undefined as Props['onlocationclick'],
  };

  $effect(() => {
    handlers.onselect = onselect;
    handlers.onlocationclick = onlocationclick;
  });

  $effect(() => {
    if (!gridEl) return;

    const api = createGrid(gridEl, {
      theme: themeQuartz.withParams(getGridTheme()),
      columnDefs: buildColumnDefs(),
      rowData: [],
      defaultColDef: {
        sortable: true,
        resizable: true,
        floatingFilter: true,
      },
      rowSelection: { mode: 'singleRow', checkboxes: false, enableClickSelection: true },
      animateRows: true,
      onSelectionChanged: () => {
        handlers.onselect?.((api.getSelectedRows()[0] as ItemRow | undefined) ?? null);
      },
      onCellClicked: (event) => {
        if (event.colDef.field === 'location_label' && event.data?.location_id != null) {
          handlers.onlocationclick?.(event.data.location_id);
        }
      },
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
    gridApi.resetRowHeights();
  });
</script>

<div class="grid" bind:this={gridEl}></div>

<style>
  .grid {
    width: 100%;
    height: calc(100vh - 11rem);
    min-height: 16rem;
  }
</style>
