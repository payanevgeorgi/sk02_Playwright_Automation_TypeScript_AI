import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const framesPageUrl = pathToFileURL(
	resolve(__dirname, '../pages/frames.html'),
).href;

test.beforeEach(async ({ page }) => {
	await page.goto(framesPageUrl, { waitUntil: 'domcontentloaded' });
});

test('cannot reach iframe elements from the page', async ({ page }) => {
	await expect(page.frameLocator('#my-frame').locator('#frame-input')).toBeVisible();
	await expect(page.locator('#frame-input')).toHaveCount(0);
});

test('saves a note inside the iframe', async ({ page }) => {
	const frame = page.frameLocator('#my-frame');

	// Alternative: frame.getByLabel('Your note')
	await frame.locator('#frame-input').fill('Hello!');
	// Alternative: frame.getByRole('button', { name: 'Save note' })
	await frame.locator('#frame-button').click();

	await expect(frame.locator('#result')).toHaveText('Saved note: Hello!');
});

test('locates the iframe by its accessible title', async ({ page }) => {
	const frame = page.frameLocator('iframe[title="Studio note form"]');

	await frame.getByLabel('Your note').fill('<Hello & welcome>');
	await frame.getByRole('button', { name: 'Save note' }).click();

	await expect(frame.getByRole('status')).toHaveText('Saved note: <Hello & welcome>');
});
