import { addMessages, init } from 'svelte-i18n';
import enGB from '../locales/en-GB.json';

const DEFAULT_LOCALE = 'en-GB';

addMessages(DEFAULT_LOCALE, enGB);

init({
  fallbackLocale: DEFAULT_LOCALE,
  initialLocale: DEFAULT_LOCALE,
});

export { DEFAULT_LOCALE };
