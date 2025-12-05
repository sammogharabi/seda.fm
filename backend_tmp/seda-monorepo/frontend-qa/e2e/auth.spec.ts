import { test, expect } from '@playwright/test';

test.describe('Authentication Issues - BUG-002', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`));

    // Enable network failure logging
    page.on('requestfailed', request => {
      console.log(`NETWORK FAIL: ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('should show dedicated /auth/login page with email and password fields', async ({ page }) => {
    // Navigate to dedicated login page that should exist
    await page.goto('/auth/login');

    // Expect dedicated login page with email and password inputs
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('text=Login').or(page.locator('text=Sign In'))).toBeVisible();
  });

  test('should show dedicated /auth/signup page with email, password, and confirm password fields', async ({ page }) => {
    // Navigate to dedicated signup page that should exist
    await page.goto('/auth/signup');

    // Expect dedicated signup page with required fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').nth(1)).toBeVisible(); // confirm password
    await expect(page.locator('text=Create Account').or(page.locator('text=Sign Up'))).toBeVisible();
  });

  test('should redirect unauthenticated users accessing /feed to /auth/login', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/');

    // Try to access a protected route
    await page.goto('/feed');

    // Should be redirected to login page
    await expect(page).toHaveURL('/auth/login');
  });

  test('should redirect unauthenticated users accessing /profile to /auth/login', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/');

    // Try to access a protected route
    await page.goto('/profile');

    // Should be redirected to login page
    await expect(page).toHaveURL('/auth/login');
  });

  test('current behavior: auth modal instead of dedicated pages', async ({ page }) => {
    // This test documents the current (incorrect) behavior
    await page.goto('/');

    // Currently shows auth modal instead of redirecting to dedicated pages
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('current behavior: can access app content without authentication', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();

    // Navigate to root and dismiss auth modal if present
    await page.goto('/');

    // Should not be able to access protected content without auth
    // This test should fail until we implement proper route protection
    const authModal = page.locator('[role="dialog"]');
    if (await authModal.isVisible()) {
      // Try to close the modal and access protected content
      await page.keyboard.press('Escape');
    }

    // Should not be able to access main app content
    const protectedContent = page.locator('text=feed').or(page.locator('text=profile'));
    await expect(protectedContent).not.toBeVisible();
  });
});

test.describe('Password Security Requirements', () => {
  test('should validate password strength during signup', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill in email
    await page.fill('input[type="email"]', 'test@example.com');

    // Test weak password
    await page.fill('input[type="password"]', '123');

    // Should show password strength indicator or validation error
    await expect(page.locator('text=weak').or(page.locator('text=Password must'))).toBeVisible();
  });

  test('should require password confirmation to match', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.fill('input[type="password"]', 'DifferentPassword123!'); // confirm password

    const signupButton = page.locator('text=Create Account').or(page.locator('text=Sign Up'));
    await signupButton.click();

    // Should show validation error for password mismatch
    await expect(page.locator('text=password').and(page.locator('text=match'))).toBeVisible();
  });
});

test.describe('Rate Limiting Tests', () => {
  test('should implement rate limiting for login attempts', async ({ page }) => {
    await page.goto('/auth/login');

    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('text=Sign In');
      await page.waitForTimeout(500);
    }

    // Should show rate limiting message after 5 attempts
    await expect(page.locator('text=rate limit').or(page.locator('text=too many'))).toBeVisible();
  });
});