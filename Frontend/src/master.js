import { mount } from 'svelte'
import master from './routes/Master.svelte'

const app = mount(master, {
  target: document.getElementById('app'),  // ✅ 'app'으로 수정
})

export default app
