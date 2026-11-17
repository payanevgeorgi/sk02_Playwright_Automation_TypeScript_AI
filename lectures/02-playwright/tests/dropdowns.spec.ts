import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dropdownsPageUrl = pathToFileURL(
	resolve(__dirname, '../pages/dropdowns.html'),
).href;

test.beforeEach(async ({ page }) => {
	await page.goto(dropdownsPageUrl, { waitUntil: 'domcontentloaded' });
});

test('starts with no country selected', async ({ page }) => {
	await expect(page.getByLabel('Country', { exact: true })).toHaveValue('');
	await expect(page.locator('#country-result')).toHaveText('No country selected.');
});











test('selects a country by value', async ({ page }) => {
	// Alternative: page.getByLabel('Country', { exact: true })
	const countryDropdown = page.locator('#country');
	await page.waitForTimeout(3000);
	await countryDropdown.selectOption('usa');
	await page.waitForTimeout(5000);

	await expect(countryDropdown).toHaveValue('usa');
	await expect(page.locator('#country-result')).toHaveText(
		'Selected country: United States (usa).',
	);
});

test('selects a country by visible label', async ({ page }) => {
	const country = page.getByRole('combobox', { name: 'Country' });
	await country.selectOption({ label: 'Canada' });

	await expect(country).toHaveValue('canada');
	await expect(page.locator('#country-result')).toHaveText(
		'Selected country: Canada (canada).',
	);
});

test('selects a country by index', async ({ page }) => {
	const country = page.getByLabel('Country', { exact: true });
	// Index 0 is the "Choose a country" placeholder.
	await country.selectOption({ index: 3 });

	await expect(country).toHaveValue('uk');
	await expect(page.locator('#country-result')).toHaveText(
		'Selected country: United Kingdom (uk).',
	);
});

test('resets the result when the placeholder is selected again', async ({ page }) => {
	const country = page.getByLabel('Country', { exact: true });
	await country.selectOption('bulgaria');
	await country.selectOption('');

	await expect(country).toHaveValue('');
	await expect(page.locator('#country-result')).toHaveText('No country selected.');
});

test('selects multiple destinations', async ({ page }) => {
	const countries = page.getByLabel('Countries you would like to visit');
	await countries.selectOption(['usa', 'canada', 'uk']);

	await expect(countries).toHaveValues(['usa', 'canada', 'uk']);
	await expect(page.locator('#countries-result')).toHaveText(
		'Selected destinations: United States, Canada, United Kingdom.',
	);
});

test('clears all selected destinations', async ({ page }) => {
	const countries = page.getByLabel('Countries you would like to visit');
	await countries.selectOption(['usa', 'bulgaria']);
	await countries.selectOption([]);

	await expect(countries).toHaveValues([]);
	await expect(page.locator('#countries-result')).toHaveText('No destinations selected.');
});
