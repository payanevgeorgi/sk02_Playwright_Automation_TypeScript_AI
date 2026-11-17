import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const uploadsPageUrl = pathToFileURL(
	resolve(__dirname, '../pages/uploads.html'),
).href;

const resumeFile = resolve(__dirname, 'test-files/resume.txt');
const portfolioFile = resolve(__dirname, 'test-files/portfolio.txt');
const referenceFile = resolve(__dirname, 'test-files/reference.txt');

test.beforeEach(async ({ page }) => {
	await page.goto(uploadsPageUrl, { waitUntil: 'domcontentloaded' });
});

test('uploads a single resume', async ({ page }) => {
	// Alternative: page.getByLabel('Resume')
	await page.locator('#resume').setInputFiles(resumeFile);
	await expect(page.locator('#resume-result')).toHaveText(
		/^Selected resume: resume\.txt \(\d+ bytes\)\.$/,
	);
});

test('replaces the selected resume', async ({ page }) => {
	const resume = page.getByLabel('Resume');
	await resume.setInputFiles(resumeFile);
	await resume.setInputFiles(portfolioFile);
	await page.waitForTimeout(3000); // Wait for the file input to process the new file

	await expect(page.locator('#resume-result')).toContainText('portfolio.txt');
	await expect(page.locator('#resume-result')).not.toContainText('resume.txt');
});

test('clears the resume with setInputFiles', async ({ page }) => {
	const resume = page.getByLabel('Resume');
	await resume.setInputFiles(resumeFile);
	await resume.setInputFiles([]);
	await expect(page.locator('#resume-result')).toHaveText('No resume selected.');
});

test('clears the resume with the clear button', async ({ page }) => {
	await page.getByLabel('Resume').setInputFiles(resumeFile);
	await page.getByRole('button', { name: 'Clear resume' }).click();

	await expect(page.locator('#resume-result')).toHaveText('No resume selected.');
});

test('uploads multiple documents', async ({ page }) => {
	await page.getByLabel('Documents', { exact: true }).setInputFiles([portfolioFile, referenceFile]);

	await expect(page.locator('#documents-result')).toHaveText('2 documents selected.');
	await expect(
		page.getByRole('list', { name: 'Selected documents' }).getByRole('listitem'),
	).toHaveText([/^portfolio\.txt/, /^reference\.txt/]);
});

test('uploads an in-memory file', async ({ page }) => {
	await page.getByLabel('Documents', { exact: true }).setInputFiles({
		name: 'notes.txt',
		mimeType: 'text/plain',
		buffer: Buffer.from('Lecture notes'),
	});

	await expect(page.locator('#documents-result')).toHaveText('1 document selected.');
	await expect(page.locator('#documents-list li')).toHaveText('notes.txt (13 bytes)');
});

test('clears all documents', async ({ page }) => {
	await page.getByLabel('Documents', { exact: true }).setInputFiles([portfolioFile, referenceFile]);
	await page.getByRole('button', { name: 'Clear documents' }).click();

	await expect(page.locator('#documents-result')).toHaveText('No documents selected.');
	await expect(page.locator('#documents-list li')).toHaveCount(0);
});
