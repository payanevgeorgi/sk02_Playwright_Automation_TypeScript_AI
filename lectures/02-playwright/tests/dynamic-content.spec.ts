import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dynamicContentPageUrl = pathToFileURL(
	resolve(__dirname, '../pages/dynamic-content.html'),
).href;

test.beforeEach(async ({ page }) => {
	await page.goto(dynamicContentPageUrl, { waitUntil: 'domcontentloaded' });
});

test('shows a loading state while the collection loads', async ({ page }) => {
	await page.getByRole('button', { name: 'Load collection' }).click();

	await expect(page.getByText('Loading collection...')).toBeVisible();
	await expect(page.locator('#load-button')).toBeDisabled();
});

test('loads the collection items', async ({ page }) => {
	await page.getByRole('button', { name: 'Load collection' }).click();

	// Web-first assertions retry until the condition is met or the timeout expires.
	await expect(page.locator('#loading')).toBeHidden();
	await expect(page.getByRole('heading', { name: 'Ready to explore' })).toBeVisible();
	await expect(page.locator('.item')).toHaveCount(6);
	await expect(page.locator('.item').first()).toHaveText('Everyday Notebook');
	await expect(page.getByRole('button', { name: 'Reload collection' })).toBeEnabled();
});

test('waits explicitly for the content to appear', async ({ page }) => {
	await page.getByRole('button', { name: 'Load collection' }).click();

	await expect(page.locator('#content')).toHaveAttribute('aria-busy', 'false');
});

test('does not duplicate items when reloading', async ({ page }) => {
	await page.getByRole('button', { name: 'Load collection' }).click();
	await page.getByRole('button', { name: 'Reload collection' }).click();

	await expect(page.getByRole('button', { name: 'Reload collection' })).toBeEnabled();
	await expect(page.locator('.item')).toHaveCount(6);
});

test('enables ordering after preparation finishes', async ({ page }) => {
	const placeOrder = page.getByRole('button', { name: 'Place demo order' });
	await expect(placeOrder).toBeDisabled();

	await page.getByRole('button', { name: 'Prepare order' }).click();
	await expect(page.locator('#order-status')).toHaveText('Preparing your order...');

	// click() auto-waits until the button becomes enabled.
	await placeOrder.click();

	await expect(page.locator('#order-status')).toHaveText('Demo order placed.');
	await expect(placeOrder).toBeDisabled();
	await expect(page.getByRole('button', { name: 'Prepare order' })).toBeEnabled();
});
