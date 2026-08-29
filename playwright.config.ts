import { defineConfig } from '@playwright/test';

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const localPort = 49152 + (process.pid % 16384);
const baseURL = externalBaseURL ?? `http://127.0.0.1:${localPort}`;

export default defineConfig({
  testDir: './e2e',
  use: { baseURL, browserName: 'chromium', headless: true },
  webServer: externalBaseURL
    ? undefined
    : {
        command: `npm run build:site && npm run preview -- --host 127.0.0.1 --port ${localPort} --strictPort`,
        url: baseURL,
        reuseExistingServer: false
      }
});
