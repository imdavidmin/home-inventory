import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

ModuleRegistry.registerModules([AllCommunityModule]);

mount(App, { target: document.getElementById('app')! });
