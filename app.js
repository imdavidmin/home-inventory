(function () {
  const API = window.API_ENDPOINT.replace(/\/$/, '');

  const TAGS_PATH_RE = /^\/tags\/(\d+)\/?$/;

  const els = {
    parentBtn: document.getElementById('btn-parent'),
    title: document.getElementById('location-title'),
    searchInput: document.getElementById('search-input'),
    searchScope: document.getElementById('search-scope'),
    clearSearchBtn: document.getElementById('btn-clear-search'),
    status: document.getElementById('status'),
    grid: document.getElementById('grid'),
  };

  function normalizeTags(tags) {
    if (Array.isArray(tags)) {
      return tags.map((tag) => String(tag).trim()).filter(Boolean);
    }
    if (typeof tags === 'string' && tags.trim()) {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) {
          return parsed.map((tag) => String(tag).trim()).filter(Boolean);
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  function formatQuantity(value) {
    return value === -1 ? '--' : value;
  }

  class TagsCellRenderer {
    init(params) {
      this.eGui = document.createElement('div');
      this.eGui.className = 'tag-cell';
      this.render(params);
    }

    refresh(params) {
      this.render(params);
      return true;
    }

    render(params) {
      const tags = normalizeTags(params.value ?? params.data?.tags);
      this.eGui.replaceChildren();
      for (const tag of tags) {
        const pill = document.createElement('span');
        pill.className = 'tag-pill';
        pill.textContent = tag;
        this.eGui.appendChild(pill);
      }
    }

    getGui() {
      return this.eGui;
    }
  }

  let locationsById = new Map();
  let gridApi = null;
  let currentLocationId = null;
  let searchTimer = null;

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 90, filter: 'agNumberColumnFilter' },
    { field: 'label', headerName: 'Label', flex: 1, minWidth: 160, filter: 'agTextColumnFilter' },
    {
      field: 'location_label',
      headerName: 'Location',
      flex: 1,
      minWidth: 140,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'quantity',
      headerName: 'Qty',
      width: 90,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => formatQuantity(params.value),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      minWidth: 160,
      filter: 'agTextColumnFilter',
      cellRenderer: TagsCellRenderer,
      autoHeight: true,
      valueGetter: (params) => normalizeTags(params.data?.tags).join(', '),
    },
    { field: 'notes', headerName: 'Notes', flex: 1, minWidth: 160, filter: 'agTextColumnFilter' },
  ];

  const gridTheme = agGrid.themeQuartz.withParams({
    accentColor: '#0e4491',
    backgroundColor: '#ffffff',
    foregroundColor: '#1a1a1a',
    headerBackgroundColor: '#fafafa',
    borderColor: '#dde1e6',
    borderRadius: 6,
    spacing: 8,
    fontSize: 14,
    headerFontSize: 13,
    wrapperBorder: true,
  });

  const gridOptions = {
    theme: gridTheme,
    columnDefs,
    defaultColDef: {
      sortable: true,
      resizable: true,
      floatingFilter: true,
    },
    animateRows: true,
    onRowClicked: (event) => {
      const locationId = event.data?.location_id;
      if (locationId != null) {
        navigateToLocation(locationId);
      }
    },
  };

  function setStatus(message, isError) {
    els.status.textContent = message || '';
    els.status.classList.toggle('error', Boolean(isError));
  }

  function parseLocationIdFromPath() {
    const match = window.location.pathname.match(TAGS_PATH_RE);
    return match ? Number(match[1]) : null;
  }

  function pathForLocation(id) {
    return id == null ? '/' : '/tags/' + id;
  }

  function navigateToLocation(id) {
    const next = pathForLocation(id);
    if (window.location.pathname !== next) {
      history.pushState({ locationId: id }, '', next);
    }
    loadPage(id);
  }

  function getSearchScope() {
    return els.searchScope.value || 'all';
  }

  function updateSearchScopeSelect() {
    const onLocationPage = currentLocationId != null;
    const locationOption = els.searchScope.querySelector('option[value="location"]');
    locationOption.disabled = !onLocationPage;
    if (!onLocationPage && els.searchScope.value === 'location') {
      els.searchScope.value = 'all';
    }
  }

  function updateParentButton() {
    if (currentLocationId == null) {
      els.parentBtn.disabled = true;
      els.parentBtn.title = 'Already viewing all locations';
      return;
    }

    const location = locationsById.get(currentLocationId);
    const parentId = location?.parent_id ?? null;

    els.parentBtn.disabled = false;
    if (parentId != null) {
      const parent = locationsById.get(parentId);
      els.parentBtn.title = parent
        ? 'Go to parent: ' + parent.label
        : 'Go to parent location';
    } else {
      els.parentBtn.title = 'Go to all locations';
    }
  }

  function updateTitle() {
    if (currentLocationId == null) {
      els.title.textContent = 'All locations';
      return;
    }
    const location = locationsById.get(currentLocationId);
    els.title.textContent = location ? location.label : 'Location #' + currentLocationId;
  }

  async function apiFetch(path) {
    const res = await fetch(API + path);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(res.status + ' ' + res.statusText + (text ? ': ' + text : ''));
    }
    return res.json();
  }

  async function loadLocations() {
    const data = await apiFetch('/locations');
    const locations = Array.isArray(data) ? data : data?.locations ?? [];
    locationsById = new Map(locations.map((loc) => [loc.id, loc]));
    return locations;
  }

  function registerLocationFromResponse(data) {
    const location = data?.location;
    if (location?.id != null) {
      locationsById.set(location.id, location);
    }
  }

  function enrichItems(items) {
    return items.map((item) => {
      const location = locationsById.get(item.location_id);
      return {
        ...item,
        location_label: location ? location.label : item.location_id ?? '',
      };
    });
  }

  function filterByLocation(items, locationId) {
    if (locationId == null) return items;
    return items.filter((item) => item.location_id === locationId);
  }

  async function fetchItemsForView(locationId) {
    if (locationId == null) {
      return enrichItems(await apiFetch('/items'));
    }
    const data = await apiFetch('/locations/' + locationId + '/items');
    registerLocationFromResponse(data);
    return enrichItems(data.items ?? []);
  }

  async function fetchSearchResults(query, scope, locationId) {
    const results = enrichItems(
      await apiFetch('/items/search?q=' + encodeURIComponent(query))
    );
    if (scope === 'location' && locationId != null) {
      return filterByLocation(results, locationId);
    }
    return results;
  }

  async function refreshGrid() {
    const query = els.searchInput.value.trim();
    const scope = getSearchScope();
    const searching = query.length > 0;

    els.clearSearchBtn.hidden = !searching;
    setStatus(searching ? 'Searching…' : 'Loading…');

    try {
      const rowData = searching
        ? await fetchSearchResults(query, scope, currentLocationId)
        : await fetchItemsForView(currentLocationId);

      if (gridApi) {
        gridApi.setGridOption('rowData', rowData);
      }

      const scopeLabel =
        searching && scope === 'location' && currentLocationId != null
          ? ' in this location'
          : searching
            ? ' everywhere'
            : '';
      setStatus(
        rowData.length + ' item' + (rowData.length === 1 ? '' : 's') + scopeLabel
      );
    } catch (err) {
      console.error(err);
      if (gridApi) gridApi.setGridOption('rowData', []);
      setStatus(err.message || 'Failed to load data', true);
    }
  }

  async function loadPage(locationId) {
    currentLocationId = locationId;
    updateSearchScopeSelect();
    await refreshGrid();
    updateTitle();
    updateParentButton();
  }

  function onParentClick() {
    if (currentLocationId == null) return;
    const location = locationsById.get(currentLocationId);
    const parentId = location?.parent_id ?? null;
    navigateToLocation(parentId);
  }

  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(refreshGrid, 250);
  }

  function initGrid() {
    gridApi = agGrid.createGrid(els.grid, gridOptions);
  }

  function bindEvents() {
    els.parentBtn.addEventListener('click', onParentClick);
    els.searchInput.addEventListener('input', onSearchInput);
    els.clearSearchBtn.addEventListener('click', () => {
      els.searchInput.value = '';
      refreshGrid();
    });
    els.searchScope.addEventListener('change', refreshGrid);
    window.addEventListener('popstate', () => {
      loadPage(parseLocationIdFromPath());
    });
  }

  async function init() {
    initGrid();
    bindEvents();
    setStatus('Loading locations…');
    try {
      await loadLocations();
      await loadPage(parseLocationIdFromPath());
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Failed to load locations', true);
    }
  }

  init();
})();
