import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dialogsPageUrl = pathToFileURL(
	resolve(__dirname, '../pages/dialogs.html'),
).href;

test.beforeEach(async ({ page }) => {
	await page.goto(dialogsPageUrl, { waitUntil: 'domcontentloaded' });
});

test('accepts an alert', async ({ page }) => {
	let dialogType = '';
	let dialogMessage = '';
	// Register the handler BEFORE triggering the dialog.
	page.once('dialog', async (dialog) => {
		dialogType = dialog.type();
		dialogMessage = dialog.message();
		await dialog.accept();
	});

	await page.getByRole('button', { name: 'Show alert' }).click();

	await expect(page.locator('#alert-result')).toHaveText('Alert closed.');
	expect(dialogType).toBe('alert');
	expect(dialogMessage).toBe('Welcome to Form & Field!');
});

test('cancels a deletion by dismissing the confirm', async ({ page }) => {
	let dialogType = '';
	page.once('dialog', async (dialog) => {
		dialogType = dialog.type();
		await dialog.dismiss();
	});

	await page.getByRole('button', { name: 'Delete saved item' }).click();

	await expect(page.locator('#confirm-result')).toHaveText('Deletion cancelled.');
	await expect(page.getByText('Saved item: Everyday Notebook')).toBeVisible();
	expect(dialogType).toBe('confirm');
});

test('deletes the item by accepting the confirm', async ({ page }) => {
	page.once('dialog', (dialog) => dialog.accept());

	await page.getByRole('button', { name: 'Delete saved item' }).click();

	await expect(page.locator('#confirm-result')).toHaveText('Saved item deleted.');
	await expect(page.getByText('Saved item: Everyday Notebook')).toBeHidden();
	await expect(page.getByRole('button', { name: 'Delete saved item' })).toBeDisabled();
});

test('enters a name in the prompt', async ({ page }) => {
	let dialogType = '';
	let defaultValue = '';
	page.once('dialog', async (dialog) => {
		dialogType = dialog.type();
		defaultValue = dialog.defaultValue();
		await dialog.accept('Taylor');
	});

	await page.getByRole('button', { name: 'Enter your name' }).click();

	await expect(page.locator('#prompt-result')).toHaveText('Hello, Taylor!');
	expect(dialogType).toBe('prompt');
	expect(defaultValue).toBe('Alex');
});

test('handles an empty prompt answer', async ({ page }) => {
	page.once('dialog', (dialog) => dialog.accept('   '));

	await page.getByRole('button', { name: 'Enter your name' }).click();

	await expect(page.locator('#prompt-result')).toHaveText('No name provided.');
});

test('cancels the prompt', async ({ page }) => {
	page.once('dialog', (dialog) => dialog.dismiss());

	await page.getByRole('button', { name: 'Enter your name' }).click();

	await expect(page.locator('#prompt-result')).toHaveText('Name entry cancelled.');
});
