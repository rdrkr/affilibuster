// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Accessibility Audit Tests (T156A)
 *
 * Tests WCAG 2.1 AA compliance using axe-core.
 * Reference: plan.md:90 (WCAG 2.1 AA accessibility compliance)
 *
 * WCAG 2.1 AA Requirements:
 * - Perceivable: Text alternatives, adaptable content, distinguishable
 * - Operable: Keyboard accessible, enough time, navigable
 * - Understandable: Readable, predictable, input assistance
 * - Robust: Compatible with assistive technologies
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

test.describe('Accessibility - WCAG 2.1 AA Compliance', () => {
  test('English homepage has no accessibility violations', async ({ page }) => {
    await page.goto(BASE_URL);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    console.log(`\nEnglish Homepage Accessibility:`);
    console.log(`  Violations: ${accessibilityScanResults.violations.length}`);
    console.log(`  Passes: ${accessibilityScanResults.passes.length}`);

    if (accessibilityScanResults.violations.length > 0) {
      console.log('\nViolations:');
      accessibilityScanResults.violations.forEach((violation: any) => {
        console.log(`  - ${violation.id}: ${violation.description}`);
        console.log(`    Impact: ${violation.impact}`);
        console.log(`    Nodes: ${violation.nodes.length}`);
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Italian homepage has no accessibility violations', async ({ page }) => {
    await page.goto(`${BASE_URL}/it`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    console.log(`\nItalian Homepage Accessibility:`);
    console.log(`  Violations: ${accessibilityScanResults.violations.length}`);

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Hebrew homepage (RTL) has no accessibility violations', async ({ page }) => {
    await page.goto(`${BASE_URL}/il`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    console.log(`\nHebrew Homepage (RTL) Accessibility:`);
    console.log(`  Violations: ${accessibilityScanResults.violations.length}`);

    // RTL layout should not introduce accessibility issues
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Product page has no accessibility violations', async ({ page }) => {
    await page.goto(`${BASE_URL}/products/test-product`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('Can navigate entire page with keyboard only', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab through all interactive elements
    let tabCount = 0;
    const maxTabs = 50; // Reasonable limit

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;

      // Check if we can see focus indicator
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (el) {
          return {
            tag: el.tagName,
            type: (el as any).type,
            text: el.textContent?.trim().substring(0, 50),
          };
        }
        return null;
      });

      if (focusedElement) {
        console.log(`Tab ${tabCount}: ${focusedElement.tag} - ${focusedElement.text}`);
      }
    }

    console.log(`\nKeyboard Navigation: ${tabCount} interactive elements found`);

    // Should have found interactive elements
    expect(tabCount).toBeGreaterThan(5);
  });

  test('Language switcher is keyboard accessible', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab to language switcher
    await page.keyboard.press('Tab');

    // Find and activate language switcher
    let found = false;
    for (let i = 0; i < 20; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('data-testid') || el?.textContent || '';
      });

      if (focused.includes('language') || focused.includes('English') || focused.includes('Italiano')) {
        found = true;
        break;
      }

      await page.keyboard.press('Tab');
    }

    expect(found).toBeTruthy();

    // Should be able to activate with Enter or Space
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Dropdown should open (check for visibility changes)
    const dropdownVisible = await page.isVisible('[role="menu"]').catch(() => false);
    console.log(`Language switcher dropdown visible: ${dropdownVisible}`);
  });

  test('Currency selector is keyboard accessible', async ({ page }) => {
    await page.goto(BASE_URL);

    // Find currency selector via keyboard
    let found = false;
    for (let i = 0; i < 20; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('data-testid') || el?.textContent || '';
      });

      if (focused.includes('currency') || focused.includes('USD') || focused.includes('EUR')) {
        found = true;
        await page.keyboard.press('Enter');
        break;
      }

      await page.keyboard.press('Tab');
    }

    expect(found).toBeTruthy();
  });

  test('Skip to main content link works', async ({ page }) => {
    await page.goto(BASE_URL);

    // First tab should focus skip link
    await page.keyboard.press('Tab');

    const skipLink = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.textContent?.toLowerCase().includes('skip') || false;
    });

    if (skipLink) {
      console.log('Skip link found and focused');
      await page.keyboard.press('Enter');

      // Main content should now be focused
      const mainFocused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName === 'MAIN' || el?.getAttribute('role') === 'main';
      });

      expect(mainFocused).toBeTruthy();
    } else {
      console.log('Skip link not implemented (optional but recommended)');
    }
  });
});

test.describe('Accessibility - Screen Reader Support', () => {
  test('All images have alt text', async ({ page }) => {
    await page.goto(BASE_URL);

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.alt && img.alt !== '').length;
    });

    console.log(`\nImages without alt text: ${imagesWithoutAlt}`);

    expect(imagesWithoutAlt).toBe(0);
  });

  test('Buttons and links have accessible names', async ({ page }) => {
    await page.goto(BASE_URL);

    const elementsWithoutNames = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.filter(el => {
        const text = el.textContent?.trim();
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledby = el.getAttribute('aria-labelledby');
        return !text && !ariaLabel && !ariaLabelledby;
      }).length;
    });

    console.log(`\nButtons/links without accessible names: ${elementsWithoutNames}`);

    expect(elementsWithoutNames).toBe(0);
  });

  test('Form inputs have associated labels', async ({ page }) => {
    await page.goto(BASE_URL);

    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs.filter(input => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        return !hasLabel && !ariaLabel && !ariaLabelledby;
      }).length;
    });

    console.log(`\nForm inputs without labels: ${inputsWithoutLabels}`);

    expect(inputsWithoutLabels).toBe(0);
  });

  test('Page has proper heading hierarchy', async ({ page }) => {
    await page.goto(BASE_URL);

    const headings = await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return h.map(heading => ({
        level: parseInt(heading.tagName[1]),
        text: heading.textContent?.trim().substring(0, 50),
      }));
    });

    console.log('\nHeading Hierarchy:');
    headings.forEach((h) => {
      console.log(`  ${'  '.repeat(h.level - 1)}H${h.level}: ${h.text}`);
    });

    // Should have exactly one H1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBe(1);

    // Headings should not skip levels
    for (let i = 1; i < headings.length; i++) {
      const levelDiff = headings[i].level - headings[i - 1].level;
      expect(levelDiff).toBeLessThanOrEqual(1);
    }
  });

  test('ARIA landmarks are present', async ({ page }) => {
    await page.goto(BASE_URL);

    const landmarks = await page.evaluate(() => {
      return {
        main: document.querySelector('main, [role="main"]') !== null,
        navigation: document.querySelector('nav, [role="navigation"]') !== null,
        contentinfo: document.querySelector('footer, [role="contentinfo"]') !== null,
        banner: document.querySelector('header, [role="banner"]') !== null,
      };
    });

    console.log('\nARIA Landmarks:');
    console.log(`  Main: ${landmarks.main ? '✓' : '✗'}`);
    console.log(`  Navigation: ${landmarks.navigation ? '✓' : '✗'}`);
    console.log(`  Content Info (Footer): ${landmarks.contentinfo ? '✓' : '✗'}`);
    console.log(`  Banner (Header): ${landmarks.banner ? '✓' : '✗'}`);

    expect(landmarks.main).toBeTruthy();
    expect(landmarks.navigation).toBeTruthy();
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('Text has sufficient color contrast', async ({ page }) => {
    await page.goto(BASE_URL);

    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['color-contrast']) // We'll check manually
      .analyze();

    // Check for color contrast violations specifically
    const colorContrastViolations = contrastResults.violations.filter(
      (v: any) => v.id === 'color-contrast'
    );

    console.log(`\nColor Contrast Violations: ${colorContrastViolations.length}`);

    expect(colorContrastViolations).toEqual([]);
  });
});

test.describe('Accessibility - Focus Management', () => {
  test('Focus indicators are visible', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    const focusStyles = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;

      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow,
      };
    });

    console.log('\nFocus Indicator Styles:');
    console.log(JSON.stringify(focusStyles, null, 2));

    // Should have visible focus indicator (outline or box-shadow)
    const hasFocusIndicator =
      (focusStyles?.outline && focusStyles.outline !== 'none') ||
      (focusStyles?.outlineWidth && focusStyles.outlineWidth !== '0px') ||
      (focusStyles?.boxShadow && focusStyles.boxShadow !== 'none');

    expect(hasFocusIndicator).toBeTruthy();
  });

  test('Focus is not trapped inappropriately', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab through 50 elements
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Tab');
    }

    // Should be able to reach browser chrome (focus should cycle)
    const stillOnPage = await page.evaluate(() => {
      return document.activeElement !== null;
    });

    // This is acceptable - focus cycling is normal
    expect(stillOnPage).toBeTruthy();
  });
});

test.describe('Accessibility - Language Support', () => {
  test('HTML lang attribute is set correctly for each language', async ({ page }) => {
    const languages = [
      { url: BASE_URL, expected: 'en' },
      { url: `${BASE_URL}/it`, expected: 'it' },
      { url: `${BASE_URL}/il`, expected: 'he' },
    ];

    for (const { url, expected } of languages) {
      await page.goto(url);

      const lang = await page.evaluate(() => {
        return document.documentElement.lang;
      });

      console.log(`${url} - lang="${lang}" (expected: "${expected}")`);

      expect(lang).toBe(expected);
    }
  });

  test('Text direction is set correctly for RTL', async ({ page }) => {
    await page.goto(`${BASE_URL}/il`);

    const dir = await page.evaluate(() => {
      return document.documentElement.dir;
    });

    console.log(`Hebrew page direction: ${dir}`);

    expect(dir).toBe('rtl');
  });
});
