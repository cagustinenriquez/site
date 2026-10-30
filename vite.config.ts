import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// The dev server sends folder URLs like /motzworld/ to the React app instead of
// public/motzworld/index.html. Production hosting serves the folder's index.html,
// so do the same in dev.
function publicFolderIndex(folders: string[]): Plugin {
  return {
    name: 'public-folder-index',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split('?')[0]
        const folder = folders.find(f => url === `/${f}` || url === `/${f}/`)
        if (folder) req.url = `/${folder}/index.html`
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), publicFolderIndex(['motzworld'])],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
