import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/',
    server: {
        port: 3000,
        open: false,
        host: true,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-core':   ['react', 'react-dom'],
                    'react-router': ['react-router-dom'],
                    'animations':   ['framer-motion'],
                    'icons':        ['react-icons'],
                    'ui':           ['swiper', 'react-hot-toast', 'react-hook-form'],
                    'query':        ['react-query'],
                    'utils':        ['axios', 'date-fns', 'lodash'],
                },
            },
        },
    },
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
        esbuildOptions: {
            loader: { '.js': 'jsx' },
        },
    },
});
