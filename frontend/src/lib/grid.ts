import type { ColDef, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import type { ItemRow } from './types';
import { formatQuantity } from './tags';

function tagsCellRenderer(params: ICellRendererParams<ItemRow>): HTMLElement {
  const container = document.createElement('div');
  container.className = 'tag-cell';

  for (const tag of params.data?.tags ?? []) {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.textContent = tag;
    container.appendChild(pill);
  }

  return container;
}

export function buildColumnDefs(): ColDef<ItemRow>[] {
  return [
    { field: 'id', headerName: 'ID', width: 90, filter: 'agNumberColumnFilter' },
    { field: 'label', headerName: 'Label', flex: 1, minWidth: 160, filter: 'agTextColumnFilter' },
    {
      field: 'location_label',
      headerName: 'Location',
      flex: 1,
      minWidth: 140,
      filter: 'agTextColumnFilter',
      cellClass: 'cell-link',
    },
    {
      field: 'quantity',
      headerName: 'Qty',
      width: 90,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: ValueFormatterParams<ItemRow, number>) =>
        formatQuantity(params.value),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      minWidth: 160,
      filter: 'agTextColumnFilter',
      cellRenderer: tagsCellRenderer,
      autoHeight: true,
      valueGetter: (params) => (params.data?.tags ?? []).join(', '),
    },
    { field: 'notes', headerName: 'Notes', flex: 1, minWidth: 160, filter: 'agTextColumnFilter' },
  ];
}
