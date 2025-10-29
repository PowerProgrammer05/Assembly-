import { mount } from 'svelte'
import Login from './routes/Login.svelte'

const app = mount(Login, {
  target: document.getElementById('login-root'),
})

export default app
