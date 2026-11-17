import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const tablesPageUrl = pathToFileURL(
	resolve(__dirname, '../pages/tables.html'),
).href;

test.beforeEach(async ({ page }) => {
	await page.goto(tablesPageUrl, { waitUntil: 'domcontentloaded' });
});

test('lists every studio member', async ({ page }) => {
	const rows = page.locator('#users-table tbody tr');

	await expect(rows).toHaveCount(4);
	await expect(page.locator('#users-table tbody td:nth-child(2)')).toHaveText([
		'John Doe',
		'Jane Smith',
		'Alex Morgan',
		'Sam Lee',
	]);
});




test('reads rows by position', async ({ page }) => {
	const rows = page.locator('#users-table tbody tr');
	const variant2 = page.locator('table#users-table tbody tr[data-user-id="1"] td:nth-child(2)');

	await expect(rows.first().getByRole('cell').nth(1)).toHaveText('John Doe');
	// Same as above, using a different selector strategy
	await expect(variant2).toHaveText('John Doe');
	await expect(rows.last().getByRole('cell').nth(1)).toHaveText('Sam Lee');
	// Playwright nth() is 0-based; CSS :nth-child() is 1-based.
	await expect(rows.nth(2)).toContainText('Alex Morgan');
	await expect(page.locator('#users-table tbody tr:nth-child(3)')).toContainText('Alex Morgan');
});






test('finds a row by its content', async ({ page }) => {
	const janeRow = page.getByRole('row').filter({ hasText: 'Jane Smith' });

	await expect(janeRow.getByRole('cell')).toHaveText([
		'2',
		'Jane Smith',
		'jane@example.com',
		'Editor',
		'Active',
		'Edit',
	]);
});

test('finds the same row with different selector strategies', async ({ page }) => {
	const byRole = page.getByRole('row', { name: /John Doe/ });
	const byText = page.locator('tr:has-text("John Doe")');
	const byTestId = page.getByTestId('edit-john').locator('xpath=ancestor::tr');
	const byXPath = page.locator('//button[text()="Edit"]/ancestor::tr').first();
	const byConditions = page.locator('//tr[contains(., "Active") and contains(., "Admin")]');

	for (const row of [byRole, byText, byTestId, byXPath, byConditions]) {
		await expect(row).toHaveAttribute('data-user-id', '1');
	}
});

test('updates the role of a member', async ({ page }) => {
	const janeRow = page.getByRole('row').filter({ hasText: 'Jane Smith' });
	await janeRow.getByRole('button', { name: 'Edit' }).click();

	await expect(page.locator('#editing-name')).toHaveText('Jane Smith');
	await expect(page.getByLabel('Member role')).toHaveValue('Editor');

	await page.getByLabel('Member role').selectOption('Admin');
	await page.getByRole('button', { name: 'Save changes' }).click();

	await expect(janeRow.locator('.member-role')).toHaveText('Admin');
	await expect(page.locator('#table-result')).toHaveText('Updated Jane Smith: Admin.');
	await expect(page.getByRole('form', { name: 'Edit member' })).toBeHidden();
	await expect(janeRow.getByRole('button', { name: 'Edit' })).toBeFocused();
});

test('keeps the role when editing is cancelled', async ({ page }) => {
	const alexRow = page.getByRole('row').filter({ hasText: 'Alex Morgan' });
	await alexRow.getByRole('button', { name: 'Edit' }).click();
	await page.getByLabel('Member role').selectOption('Admin');
	await page.getByRole('button', { name: 'Cancel' }).click();

	await expect(alexRow.locator('.member-role')).toHaveText('Viewer');
	await expect(page.locator('#table-result')).toBeHidden();
});
