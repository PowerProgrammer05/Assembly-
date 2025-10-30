import { mount } from 'svelte';
import Ranking from './routes/Ranking.svelte';

const app = mount(Ranking, {
  target: document.getElementById('app')
});

export default app;
