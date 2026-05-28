import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const MIME = { '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-images-sku',
      configureServer(server) {
        const imagesDir = path.resolve(process.cwd(), 'assets', 'imagesSKU')
        server.middlewares.use('/images', (req, res, next) => {
          const file = path.join(imagesDir, decodeURIComponent(req.url || '/'))
          if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream')
            fs.createReadStream(file).pipe(res)
          } else {
            next()
          }
        })
      },
    },
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: {
      ignored: ['**/assets/imagesSKU/**'],
    },
  },
})
