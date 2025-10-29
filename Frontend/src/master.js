import { mount } from 'svelte'
import master from './routes/Master.svelte'

const app = mount(master, {
  target: document.getElementById('app'),
})

export default app
