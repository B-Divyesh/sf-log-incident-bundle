import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL, browserName: 'chromium', headless: true },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : { command: 'npm run build:site && npm run preview -- --host 127.0.0.1', url: baseURL, reuseExistingServer: true }
});
