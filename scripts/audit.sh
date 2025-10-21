#!/bin/bash

# Copyright (c) 2025 Affilibuster by Ronen Druker.
#
# Lighthouse Audit Automation (T154)
# Run Lighthouse audits for all languages and generate reports
# Reference: plan.md:79, 193-196

set -e

# Configuration
BASE_URL="${1}"
OUTPUT_DIR="reports/lighthouse"
THRESHOLD=90

echo "🔍 Running Lighthouse Audits"
echo "============================="
echo "Base URL: ${BASE_URL}"
echo "Output: ${OUTPUT_DIR}"
echo "Threshold: ${THRESHOLD}"
echo ""

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Check if lighthouse is installed
if ! command -v lighthouse &>/dev/null; then
  echo "⚠️  Lighthouse not found. Installing..."
  npm install -g lighthouse
fi

# Function to run lighthouse audit
run_audit() {
  local url=$1
  local name=$2
  local output_file="${OUTPUT_DIR}/${name}"

  echo "🔍 Auditing: ${url}"

  lighthouse "${url}" \
    --output html \
    --output json \
    --output-path "${output_file}" \
    --chrome-flags="--headless --no-sandbox" \
    --quiet

  echo "✅ Report saved: ${output_file}.html"
}

# Function to extract scores from JSON report
extract_scores() {
  local json_file=$1

  if [[ ! -f "${json_file}" ]]; then
    echo "N/A"
    return
  fi

  # Extract scores using jq (if available) or grep/awk
  if command -v jq &>/dev/null; then
    performance=$(jq -r '.categories.performance.score * 100' "${json_file}" 2>/dev/null || echo "N/A")
    accessibility=$(jq -r '.categories.accessibility.score * 100' "${json_file}" 2>/dev/null || echo "N/A")
    bestpractices=$(jq -r '.categories["best-practices"].score * 100' "${json_file}" 2>/dev/null || echo "N/A")
    seo=$(jq -r '.categories.seo.score * 100' "${json_file}" 2>/dev/null || echo "N/A")

    echo "${performance} ${accessibility} ${bestpractices} ${seo}"
  else
    echo "N/A N/A N/A N/A"
  fi
}

# Run audits for all language versions
echo "Running audits for all languages..."
echo ""

run_audit "${BASE_URL}" "lighthouse-en"
run_audit "${BASE_URL}/it" "lighthouse-it"
run_audit "${BASE_URL}/he" "lighthouse-il"

echo ""
echo "============================="
echo "📊 Lighthouse Audit Results"
echo "============================="
echo ""

# Display results table
printf "%-15s %-15s %-15s %-15s %-15s\n" "Language" "Performance" "Accessibility" "Best Practices" "SEO"
printf "%-15s %-15s %-15s %-15s %-15s\n" "--------" "-----------" "-------------" "--------------" "---"

for lang in en it il; do
  # shellcheck disable=SC2311
  scores=$(extract_scores "${OUTPUT_DIR}/lighthouse-${lang}.report.json")
  read -r perf a11y bp seo <<<"${scores}"

  printf "%-15s" "${lang}"

  # Display scores
  for score in "${perf}" "${a11y}" "${bp}" "${seo}"; do
    if [[ "${score}" = "N/A" ]]; then
      printf "%-15s" "${score}"
    elif [[ "${score%.*}" -ge "${THRESHOLD}" ]]; then
      printf "%-15s" "${score}"
    elif [[ "${score%.*}" -ge 50 ]]; then
      printf "%-15s" "${score}"
    else
      printf "%-15s" "${score}"
    fi
  done
  echo ""
done

echo ""
echo "============================="
echo ""
echo "✅ All reports generated successfully!"
echo ""
echo "View reports:"
echo "  - English:  file://$(pwd)/${OUTPUT_DIR}/lighthouse-en.report.html"
echo "  - Italian:  file://$(pwd)/${OUTPUT_DIR}/lighthouse-it.report.html"
echo "  - Hebrew:   file://$(pwd)/${OUTPUT_DIR}/lighthouse-il.report.html"
echo ""

# Check if any score is below threshold
FAILED=0
for lang in en it il; do
  # shellcheck disable=SC2311
  scores=$(extract_scores "${OUTPUT_DIR}/lighthouse-${lang}.report.json")
  read -r perf a11y bp seo <<<"${scores}"

  if [[ "${perf}" != "N/A" ]] && [[ "${perf%.*}" -lt "${THRESHOLD}" ]]; then
    echo "⚠️  ${lang}: Performance score ${perf} below threshold"
    FAILED=1
  fi
done

if [[ ${FAILED} -eq 0 ]]; then
  echo "✅ All scores meet the threshold of ${THRESHOLD}!"
  exit 0
else
  echo "❌ Some scores are below threshold. Review reports."
  exit 1
fi
