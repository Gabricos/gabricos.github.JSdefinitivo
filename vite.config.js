// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Impostazioni di base
  root: './', // La directory root del progetto
  publicDir: 'public', // Directory per i file statici
  server: {
    port: 3000, // Porta del server di sviluppo
    open: true, // Apre automaticamente il browser all'avvio
  },
  build: {
    outDir: 'dist', // Directory di output per la build
    assetsDir: 'assets', // Directory per le risorse compilate
    emptyOutDir: true, // Svuota la directory di output prima della build
  },
  // Ottimizzazioni
  optimizeDeps: {
    include: ['axios', 'lodash-es'], // Include questi pacchetti nell'ottimizzazione delle dipendenze
  },
  resolve: {
    // Aiuta Vite a risolvere i moduli npm
    dedupe: ['axios', 'lodash-es']
  }
});