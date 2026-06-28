import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { mount } from 'svelte';
import { waitLocale } from 'svelte-i18n';
import App from './App.svelte';
import './app.css';
import './lib/i18n';

ModuleRegistry.registerModules([AllCommunityModule]);

waitLocale().then(() => {
  mount(App, { target: document.getElementById('app')! });
});
