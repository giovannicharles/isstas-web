import { expect, test } from '@playwright/test';

/** Parcours cles du site public. Necessite l'API lancee et seedee (php artisan serve). */
test('switches language and keeps the page', async ({ page }) => {
  await page.goto('/fr/admission/frais');
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/admission\/frais/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/fees/i);
});

test('finds a programme from a diploma on the home page', async ({ page }) => {
  await page.goto('/fr');
  await page.getByLabel('Mon dernier diplÃ´me').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Voir les filiÃ¨res' }).click();
  await expect(page.getByRole('list').filter({ hasText: 'mois' }).first()).toBeVisible();
});

test('simulates the instalments', async ({ page }) => {
  await page.goto('/fr/admission/frais');
  await page.getByLabel('Niveau').selectOption({ label: 'BTS' });
  await page.getByLabel('Nombre de mensualitÃ©s').selectOption('3');
  await expect(page.getByText('Montant par mensualitÃ©')).toBeVisible();
});

test('shows the back-to-top button after scrolling', async ({ page }) => {
  await page.goto('/fr');
  const button = page.getByRole('button', { name: 'Retour en haut' });
  await expect(button).toHaveCSS('opacity', '0');
  await page.mouse.wheel(0, 1200);
  await expect(button).toHaveCSS('opacity', '1');
});

test('has no horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/fr');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
