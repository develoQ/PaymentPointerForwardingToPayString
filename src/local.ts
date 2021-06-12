import consola from 'consola'
import { app } from './app'

const HOST = 'localhost'
const PORT = 3000

app.listen(PORT, () => {
  consola.ready({
    message: `Server listening on http://${HOST}:${PORT}`,
    badge: true,
  })
})
