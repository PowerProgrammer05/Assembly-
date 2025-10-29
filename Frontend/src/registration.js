import { mount } from 'svelte'
import Registration from './routes/Registration.svelte'

const app = mount(Registration, {
  target: document.getElementById('registration-root'),
})

export default app
