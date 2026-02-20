import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true
    },
    esbuild: {
        loader: 'jsx',  // Set default loader to jsx
        include: /src\/.*\.jsx?$/,  // Include both .js and .jsx files
        exclude: []
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',  // Treat .js files as JSX
            },
        },
    },
});