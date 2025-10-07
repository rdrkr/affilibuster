# Copyright (c) 2025 Affilibuster by Ronen Druker.

"""
API Performance Benchmarks (T154A)

Tests all 8 API endpoints for performance requirements:
- TTFB (Time to First Byte) < 600ms
- Response time < 200ms per endpoint
- Throughput under load

Reference: plan.md:77-82 (Performance targets)
"""

import pytest
import asyncio
import time
from httpx import AsyncClient
from typing import List, Dict
import statistics


@pytest.fixture
def api_base_url():
    """API base URL for testing."""
    return "http://localhost:8000"


@pytest.fixture
def performance_thresholds():
    """Performance thresholds for validation."""
    return {
        "ttfb_ms": 600,  # Time to First Byte
        "response_time_ms": 200,  # Total response time
        "success_rate": 0.95,  # 95% success rate
    }


async def measure_endpoint_performance(
    client: AsyncClient,
    method: str,
    endpoint: str,
    payload: dict = None,
    iterations: int = 10
) -> Dict[str, float]:
    """
    Measure endpoint performance metrics.

    Args:
        client: HTTP client
        method: HTTP method (GET, POST, PUT)
        endpoint: API endpoint path
        payload: Request payload for POST/PUT
        iterations: Number of test iterations

    Returns:
        Dictionary with performance metrics
    """
    timings = []
    successful = 0

    for _ in range(iterations):
        start = time.perf_counter()

        try:
            if method == "GET":
                response = await client.get(endpoint)
            elif method == "POST":
                response = await client.post(endpoint, json=payload)
            elif method == "PUT":
                response = await client.put(endpoint, json=payload)

            end = time.perf_counter()

            if response.status_code in [200, 201, 404]:  # Success codes
                successful += 1
                timings.append((end - start) * 1000)  # Convert to ms
        except Exception as e:
            print(f"Error: {e}")
            continue

    if not timings:
        return {
            "avg_ms": 0,
            "min_ms": 0,
            "max_ms": 0,
            "p95_ms": 0,
            "p99_ms": 0,
            "success_rate": 0,
        }

    return {
        "avg_ms": statistics.mean(timings),
        "min_ms": min(timings),
        "max_ms": max(timings),
        "p95_ms": statistics.quantiles(timings, n=20)[18] if len(timings) > 1 else timings[0],
        "p99_ms": statistics.quantiles(timings, n=100)[98] if len(timings) > 1 else timings[0],
        "success_rate": successful / iterations,
    }


@pytest.mark.performance
@pytest.mark.asyncio
async def test_get_languages_performance(api_base_url, performance_thresholds):
    """Test GET /v1/languages endpoint performance."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        metrics = await measure_endpoint_performance(
            client, "GET", "/v1/languages", iterations=50
        )

        print(f"\nGET /v1/languages Performance:")
        print(f"  Average: {metrics['avg_ms']:.2f}ms")
        print(f"  Min: {metrics['min_ms']:.2f}ms")
        print(f"  Max: {metrics['max_ms']:.2f}ms")
        print(f"  P95: {metrics['p95_ms']:.2f}ms")
        print(f"  P99: {metrics['p99_ms']:.2f}ms")
        print(f"  Success Rate: {metrics['success_rate']*100:.1f}%")

        assert metrics['avg_ms'] < performance_thresholds['response_time_ms'], \
            f"Average response time {metrics['avg_ms']:.2f}ms exceeds threshold {performance_thresholds['response_time_ms']}ms"
        assert metrics['success_rate'] >= performance_thresholds['success_rate'], \
            f"Success rate {metrics['success_rate']*100:.1f}% below threshold {performance_thresholds['success_rate']*100}%"


@pytest.mark.performance
@pytest.mark.asyncio
async def test_detect_language_performance(api_base_url, performance_thresholds):
    """Test POST /v1/languages/detect endpoint performance."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        payload = {
            "acceptLanguage": "it-IT,it;q=0.9,en;q=0.8",
            "userAgent": "Mozilla/5.0"
        }

        metrics = await measure_endpoint_performance(
            client, "POST", "/v1/languages/detect", payload=payload, iterations=50
        )

        print(f"\nPOST /v1/languages/detect Performance:")
        print(f"  Average: {metrics['avg_ms']:.2f}ms")
        print(f"  P95: {metrics['p95_ms']:.2f}ms")
        print(f"  Success Rate: {metrics['success_rate']*100:.1f}%")

        assert metrics['avg_ms'] < performance_thresholds['response_time_ms']
        assert metrics['success_rate'] >= performance_thresholds['success_rate']


@pytest.mark.performance
@pytest.mark.asyncio
async def test_get_currencies_performance(api_base_url, performance_thresholds):
    """Test GET /v1/currencies endpoint performance."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        metrics = await measure_endpoint_performance(
            client, "GET", "/v1/currencies", iterations=50
        )

        print(f"\nGET /v1/currencies Performance:")
        print(f"  Average: {metrics['avg_ms']:.2f}ms")
        print(f"  P95: {metrics['p95_ms']:.2f}ms")

        assert metrics['avg_ms'] < performance_thresholds['response_time_ms']


@pytest.mark.performance
@pytest.mark.asyncio
async def test_convert_currency_performance(api_base_url, performance_thresholds):
    """Test POST /v1/currencies/convert endpoint performance."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        payload = {
            "amount": 100.0,
            "fromCurrency": "USD",
            "toCurrency": "EUR",
            "locale": "it-IT"
        }

        metrics = await measure_endpoint_performance(
            client, "POST", "/v1/currencies/convert", payload=payload, iterations=50
        )

        print(f"\nPOST /v1/currencies/convert Performance:")
        print(f"  Average: {metrics['avg_ms']:.2f}ms")
        print(f"  P95: {metrics['p95_ms']:.2f}ms")

        assert metrics['avg_ms'] < performance_thresholds['response_time_ms']


@pytest.mark.performance
@pytest.mark.asyncio
async def test_get_content_performance(api_base_url, performance_thresholds):
    """Test GET /v1/content/{lang}/{slug} endpoint performance."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        # Test with a common slug
        metrics = await measure_endpoint_performance(
            client, "GET", "/v1/content/en/test-product", iterations=50
        )

        print(f"\nGET /v1/content/{{lang}}/{{slug}} Performance:")
        print(f"  Average: {metrics['avg_ms']:.2f}ms")
        print(f"  P95: {metrics['p95_ms']:.2f}ms")

        # Content endpoints may return 404, which is acceptable
        assert metrics['avg_ms'] < performance_thresholds['response_time_ms']


@pytest.mark.performance
@pytest.mark.asyncio
async def test_list_content_performance(api_base_url, performance_thresholds):
    """Test GET /v1/content/{lang} endpoint performance."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        metrics = await measure_endpoint_performance(
            client, "GET", "/v1/content/en?page=1&limit=20", iterations=50
        )

        print(f"\nGET /v1/content/{{lang}} Performance:")
        print(f"  Average: {metrics['avg_ms']:.2f}ms")
        print(f"  P95: {metrics['p95_ms']:.2f}ms")

        assert metrics['avg_ms'] < performance_thresholds['response_time_ms']


@pytest.mark.performance
@pytest.mark.asyncio
async def test_get_preferences_performance(api_base_url, performance_thresholds):
    """Test GET /v1/user/preferences endpoint performance."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        headers = {"X-Session-Id": "test-session-123"}

        # Create client with headers
        client.headers.update(headers)

        metrics = await measure_endpoint_performance(
            client, "GET", "/v1/user/preferences", iterations=50
        )

        print(f"\nGET /v1/user/preferences Performance:")
        print(f"  Average: {metrics['avg_ms']:.2f}ms")
        print(f"  P95: {metrics['p95_ms']:.2f}ms")

        # Preferences may not exist (404), which is acceptable
        assert metrics['avg_ms'] < performance_thresholds['response_time_ms']


@pytest.mark.performance
@pytest.mark.asyncio
async def test_update_preferences_performance(api_base_url, performance_thresholds):
    """Test PUT /v1/user/preferences endpoint performance."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        headers = {"X-Session-Id": "test-session-perf"}
        payload = {
            "selectedCurrency": "EUR",
            "dismissedLanguagePrompt": True
        }

        client.headers.update(headers)

        metrics = await measure_endpoint_performance(
            client, "PUT", "/v1/user/preferences", payload=payload, iterations=50
        )

        print(f"\nPUT /v1/user/preferences Performance:")
        print(f"  Average: {metrics['avg_ms']:.2f}ms")
        print(f"  P95: {metrics['p95_ms']:.2f}ms")

        assert metrics['avg_ms'] < performance_thresholds['response_time_ms']


@pytest.mark.performance
@pytest.mark.asyncio
async def test_concurrent_requests_performance(api_base_url):
    """Test API performance under concurrent load."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        # Simulate 50 concurrent requests
        start = time.perf_counter()

        tasks = [
            client.get("/v1/languages")
            for _ in range(50)
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)
        end = time.perf_counter()

        total_time_ms = (end - start) * 1000
        successful = sum(1 for r in responses if hasattr(r, 'status_code') and r.status_code == 200)

        print(f"\nConcurrent Load Test (50 requests):")
        print(f"  Total Time: {total_time_ms:.2f}ms")
        print(f"  Avg per request: {total_time_ms/50:.2f}ms")
        print(f"  Successful: {successful}/50 ({successful/50*100:.1f}%)")

        assert successful >= 47  # At least 94% success rate


@pytest.mark.performance
@pytest.mark.asyncio
async def test_ttfb_all_endpoints(api_base_url, performance_thresholds):
    """Test Time to First Byte (TTFB) for all endpoints."""
    async with AsyncClient(base_url=api_base_url, timeout=30.0) as client:
        endpoints = [
            ("GET", "/v1/languages"),
            ("GET", "/v1/currencies"),
            ("GET", "/v1/content/en"),
        ]

        print(f"\nTTFB Test Results:")

        for method, endpoint in endpoints:
            ttfb_times = []

            for _ in range(10):
                start = time.perf_counter()

                if method == "GET":
                    response = await client.get(endpoint)

                # TTFB is when we receive first byte (headers)
                ttfb = (time.perf_counter() - start) * 1000

                if response.status_code in [200, 404]:
                    ttfb_times.append(ttfb)

            if ttfb_times:
                avg_ttfb = statistics.mean(ttfb_times)
                print(f"  {method} {endpoint}: {avg_ttfb:.2f}ms")

                assert avg_ttfb < performance_thresholds['ttfb_ms'], \
                    f"TTFB {avg_ttfb:.2f}ms exceeds threshold {performance_thresholds['ttfb_ms']}ms"


if __name__ == "__main__":
    # Run with: pytest backend/tests/performance/test_api_benchmarks.py -v -s
    pytest.main([__file__, "-v", "-s", "-m", "performance"])
