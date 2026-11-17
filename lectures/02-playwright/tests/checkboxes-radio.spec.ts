import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const checkboxesPageUrl = pathToFileURL(
	resolve(__dirname, '../pages/checkboxes-radio.html'),
).href;

test.beforeEach(async ({ page }) => {
	await page.goto(checkboxesPageUrl, { waitUntil: 'domcontentloaded' });
});

test('shows the default selections', async ({ page }) => {
	// Attribute selector: every id that starts with "interest".
	await expect(page.locator('[id^="interest"]:checked')).toHaveCount(0);
	await expect(page.getByLabel('Beginner')).toBeChecked();
	await expect(page.getByLabel('Send me the newsletter')).toBeChecked();
	await expect(page.getByLabel('Accept Terms')).not.toBeChecked();
});


test('checks and unchecks a checkbox', async ({ page }) => {
	const testing = page.getByRole('checkbox', { name: 'Testing' });

	await testing.check();
	await expect(testing).toBeChecked();

	await testing.uncheck();
	await expect(testing).not.toBeChecked();
});

test('allows only one experience level', async ({ page }) => {
	// Alternative: page.getByRole('radio', { name: 'Advanced' })
	await page.locator('#exp-advanced').check();

	await expect(page.getByLabel('Advanced')).toBeChecked();
	await expect(page.getByLabel('Beginner')).not.toBeChecked();
	await expect(page.locator('input[name="experience"]:checked')).toHaveCount(1);
});

test('requires the terms before registering', async ({ page }) => {
	await page.getByRole('button', { name: 'Submit Registration' }).click();

	await expect(page.getByRole('alert')).toHaveText(
		'Please accept the terms before registering.',
	);
	await expect(page.getByLabel('Accept Terms')).toBeFocused();
	await expect(page.locator('#registration-result')).toBeHidden();
});

test('submits the selected preferences', async ({ page }) => {
	await page.getByLabel('Design').check();
	await page.getByLabel('Testing').check();
	await page.getByLabel('Intermediate').check();
	await page.getByLabel('Send me the newsletter').uncheck();
	await page.getByLabel('Accept Terms').check();
	// Alternative: page.getByRole('button', { name: 'Submit Registration' })
	await page.getByTestId('submit-btn').click();

	await expect(page.getByRole('alert')).toBeHidden();
	await expect(page.locator('#registration-result')).toHaveText(
		'Registration complete.\nInterests: Design, Testing.\nExperience: Intermediate.\nNewsletter: No.',
	);
});

test('hides the previous result after a change', async ({ page }) => {
	await page.getByLabel('Accept Terms').check();
	await page.getByRole('button', { name: 'Submit Registration' }).click();
	await expect(page.locator('#registration-result')).toBeVisible();

	await page.getByLabel('Development').check();

	await expect(page.locator('#registration-result')).toBeHidden();
});
