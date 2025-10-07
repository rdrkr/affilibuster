#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.
#
# Manual Validation Checklist (T156)
# Interactive script to guide through manual validation tests
# Reference: quickstart.md:103-249 (Tests 1-6)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

BASE_URL="${1:-http://localhost:3000}"

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Affilibuster Manual Validation Checklist (T156)     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "This script will guide you through 6 manual validation tests"
echo "from quickstart.md to verify all features work correctly."
echo ""
echo "Base URL: $BASE_URL"
echo ""
read -p "Press Enter to start..."

# Counters
PASSED=0
FAILED=0

# Function to ask for confirmation
check() {
    local test_name=$1
    echo ""
    echo -e "${BLUE}$test_name${NC}"
    read -p "Did this test pass? (y/n): " answer

    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED=$((PASSED+1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED=$((FAILED+1))
        return 1
    fi
}

clear

echo "═══════════════════════════════════════════════════════════"
echo "TEST 1: Language Detection & Prompt"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Steps:"
echo "1. Open browser settings and set language to Italian"
echo "2. Open new incognito window"
echo "3. Navigate to: $BASE_URL"
echo ""
echo "Expected Results:"
echo "  ✓ Non-intrusive prompt appears with Italian text:"
echo "    \"Vuoi passare alla versione italiana?\""
echo "  ✓ \"Sì\" and \"No\" buttons visible"
echo "  ✓ Clicking \"Sì\" redirects to $BASE_URL/it"
echo "  ✓ UI text displays in Italian"
echo "  ✓ HTML has <html lang=\"it\">"
echo ""
read -p "Press Enter when you've completed this test..."

check "TEST 1: Language detection and prompt"

clear

echo "═══════════════════════════════════════════════════════════"
echo "TEST 2: Manual Language Switching"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Steps:"
echo "1. Navigate to: $BASE_URL/products/eco-bottle"
echo "2. Locate language selector in navigation"
echo "3. Click language selector"
echo ""
echo "Expected Results:"
echo "  ✓ Dropdown shows all 3 languages:"
echo "    - English (current, checkmark)"
echo "    - Italiano"
echo "    - עברית"
echo "  ✓ Select \"עברית\" (Hebrew)"
echo "  ✓ Redirects to $BASE_URL/il/products/eco-bottle"
echo "  ✓ Layout switches to RTL (dir=\"rtl\" on <html>)"
echo "  ✓ UI text in Hebrew"
echo "  ✓ Navigation items mirrored (right-aligned)"
echo ""
echo "Now test Italian:"
echo "  ✓ Select \"Italiano\""
echo "  ✓ Redirects to $BASE_URL/it/prodotti/bottiglia-eco"
echo "  ✓ Note: Slug translated to Italian"
echo ""
read -p "Press Enter when you've completed this test..."

check "TEST 2: Manual language switching (all 3 languages)"

clear

echo "═══════════════════════════════════════════════════════════"
echo "TEST 3: Currency Selection & Persistence"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Steps:"
echo "1. Navigate to: $BASE_URL/it (Italian site)"
echo "2. Find a product page with prices"
echo ""
echo "Expected Results:"
echo "  ✓ Prices display in EUR (default for Italian): \"27,50 €\""
echo "  ✓ Open currency selector"
echo "  ✓ Select \"USD\""
echo "  ✓ Prices update to USD format: \"\$29.99\""
echo "  ✓ Switch language to Hebrew ($BASE_URL/il)"
echo "  ✓ Prices STILL show in USD (preference persisted)"
echo "  ✓ Check DevTools → Application → Cookies"
echo "  ✓ Cookie or session storage contains selectedCurrency: USD"
echo "  ✓ Close browser, reopen, navigate to /it again"
echo "  ✓ Prices still in USD (30-day persistence)"
echo ""
read -p "Press Enter when you've completed this test..."

check "TEST 3: Currency selection and persistence"

clear

echo "═══════════════════════════════════════════════════════════"
echo "TEST 4: SEO Meta Tags & hreflang"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Steps:"
echo "1. Navigate to: $BASE_URL/it/prodotti/bottiglia-eco"
echo "2. Right-click → \"View Page Source\""
echo ""
echo "Expected Results:"
echo "  ✓ <html lang=\"it\">"
echo "  ✓ hreflang tags present:"
echo "    <link rel=\"alternate\" hreflang=\"x-default\" href=\"$BASE_URL/products/eco-bottle\" />"
echo "    <link rel=\"alternate\" hreflang=\"it\" href=\"$BASE_URL/it/prodotti/bottiglia-eco\" />"
echo "    <link rel=\"alternate\" hreflang=\"he\" href=\"$BASE_URL/il/products/eco-bottle\" />"
echo "  ✓ Canonical URL points to current page:"
echo "    <link rel=\"canonical\" href=\"$BASE_URL/it/prodotti/bottiglia-eco\" />"
echo "  ✓ Schema markup in Italian (JSON-LD):"
echo "    \"@type\": \"WebPage\", \"inLanguage\": \"it\""
echo "  ✓ Meta tags in Italian:"
echo "    <title>Bottiglia Ecologica | Affilibuster</title>"
echo ""
read -p "Press Enter when you've completed this test..."

check "TEST 4: SEO meta tags and hreflang"

clear

echo "═══════════════════════════════════════════════════════════"
echo "TEST 5: URL Redirects (301 & 410)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Steps for 301 Redirect (Slug Change):"
echo "1. In CMS ($BASE_URL:1337/admin), login as admin"
echo "2. Navigate to Content → Products → \"Eco Bottle\""
echo "3. Change English slug from 'eco-bottle' to 'eco-water-bottle'"
echo "4. Save and publish"
echo "5. Navigate to old URL: $BASE_URL/products/eco-bottle"
echo ""
echo "Expected Results:"
echo "  ✓ 301 redirect to $BASE_URL/products/eco-water-bottle"
echo "  ✓ Content displays correctly at new URL"
echo ""
echo "Steps for 410 Gone (Content Deletion):"
echo "1. In CMS, find a test product (e.g., \"Test Product IT\")"
echo "2. Note its Italian URL: /it/prodotti/test-product"
echo "3. Delete the Italian version only (keep English)"
echo "4. Navigate to deleted URL: $BASE_URL/it/prodotti/test-product"
echo ""
echo "Expected Results:"
echo "  ✓ 410 Gone status"
echo "  ✓ Custom 410 page displays in Italian:"
echo "    \"Questo contenuto non è più disponibile\""
echo "  ✓ Link back to homepage"
echo ""
read -p "Press Enter when you've completed this test..."

check "TEST 5: URL redirects (301 and 410)"

clear

echo "═══════════════════════════════════════════════════════════"
echo "TEST 6: Content Fallback to English"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Steps:"
echo "1. In CMS, create a new product: \"New Eco Gadget\""
echo "2. Publish ONLY English version (don't translate to Italian or Hebrew)"
echo "3. Navigate to English: $BASE_URL/products/new-eco-gadget"
echo ""
echo "Expected Results:"
echo "  ✓ Content displays in English"
echo "  ✓ Switch to Italian site: $BASE_URL/it"
echo "  ✓ Try to access: $BASE_URL/it/products/new-eco-gadget"
echo "  ✓ Page renders (not 404)"
echo "  ✓ UI/navigation in Italian"
echo "  ✓ Content body in English (fallback)"
echo "  ✓ Notice displayed: \"This content is not yet available in Italian\""
echo "  ✓ Switch to Hebrew: $BASE_URL/il/products/new-eco-gadget"
echo "  ✓ Same behavior (UI in Hebrew, content in English)"
echo ""
read -p "Press Enter when you've completed this test..."

check "TEST 6: Content fallback to English"

clear

echo "═══════════════════════════════════════════════════════════"
echo "VALIDATION SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}/6"
echo -e "Failed: ${RED}$FAILED${NC}/6"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ ALL MANUAL VALIDATION TESTS PASSED!${NC}"
    echo ""
    echo "The implementation meets all functional requirements."
    echo "Proceed with production deployment."
    exit 0
else
    echo -e "${RED}${BOLD}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please review the failed tests and fix the issues."
    echo "Refer to quickstart.md for detailed test scenarios."
    exit 1
fi
