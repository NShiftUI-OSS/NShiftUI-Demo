import { readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'

function localCertDirectory() {
  if (process.env.NSHIFTUI_LOCAL_CERT_DIR) {
    return path.resolve(process.env.NSHIFTUI_LOCAL_CERT_DIR)
  }

  const home = os.homedir()
  const base =
    process.platform === 'win32'
      ? process.env.LOCALAPPDATA ?? path.join(home, 'AppData', 'Local')
      : process.platform === 'darwin'
        ? path.join(home, 'Library', 'Application Support')
        : process.env.XDG_DATA_HOME ?? path.join(home, '.local', 'share')

  return path.join(base, 'NShiftUI', 'local-certs')
}

const certDirectory = localCertDirectory()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    https: {
      key: readFileSync(path.join(certDirectory, 'local-ca.key')),
      cert: readFileSync(path.join(certDirectory, 'local-ca.crt')),
    },
  },
})
