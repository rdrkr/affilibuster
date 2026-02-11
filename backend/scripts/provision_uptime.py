#!/usr/bin/env python3  # noqa: EXE001
# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Uptime Kuma Provisioning Script.

Syncs monitors from uptime-kuma-monitors.yaml to a running Uptime Kuma instance.
"""

import logging
import os
import sys
from pathlib import Path
from typing import Any

import yaml
from uptime_kuma_api import MonitorType, UptimeKumaApi

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Configuration
# Script is located in backend/scripts/provision_uptime.py
# Config is at root/uptime-kuma-monitors.yaml
CURRENT_DIR = Path(__file__).parent.resolve()


def find_config_file() -> Path:
    """Find the configuration file in possible locations."""
    filename = "uptime-kuma-monitors.yaml"
    possible_paths = [
        CURRENT_DIR.parent / filename,  # Docker: /app/uptime-kuma-monitors.yaml
        CURRENT_DIR.parent.parent / filename,  # Local:  repo_root/uptime-kuma-monitors.yaml
        Path("/") / filename,  # Root:   /uptime-kuma-monitors.yaml
    ]

    for path in possible_paths:
        if path.exists():
            return path

    logger.error("Configuration file '%s' not found in any expected location.", filename)
    sys.exit(1)


YAML_FILE = find_config_file()
URL = os.getenv("UPTIME_KUMA_URL", "http://localhost:3001")
USERNAME = os.getenv("UPTIME_KUMA_USER")
PASSWORD = os.getenv("UPTIME_KUMA_PASS")


def load_config(filepath: Path) -> dict[str, Any]:
    """
    Load configuration from a YAML file.

    Args:
        filepath: Path to the YAML file.

    Returns:
        dict: Parsed configuration.

    """
    if not filepath.exists():
        logger.error("Configuration file '%s' not found.", filepath)
        sys.exit(1)

    with filepath.open() as f:
        return yaml.safe_load(f)  # type: ignore[no-any-return]


def get_monitor_type(type_str: str) -> MonitorType:
    """
    Map string monitor type to library Enum.

    Args:
        type_str: String representation of monitor type (e.g., 'http').

    Returns:
        MonitorType: Enum value.

    """
    type_map = {
        "http": MonitorType.HTTP,
        "keyword": MonitorType.KEYWORD,
        "ping": MonitorType.PING,
        "port": MonitorType.PORT,
        # Add more mappings as needed
    }
    return type_map.get(type_str.lower(), MonitorType.HTTP)


def provision_monitors(api: UptimeKumaApi, config: dict[str, Any]) -> None:
    """
    Provision monitors based on configuration.

    Args:
        api: Authenticated UptimeKumaApi instance.
        config: Configuration dictionary.

    """
    logger.info("Fetching existing monitors...")
    existing_monitors = api.get_monitors()
    existing_map = {m["name"]: m for m in existing_monitors}

    # Process Groups and Monitors
    groups = config.get("monitor_groups", [])

    for group in groups:
        group_name = group.get("name", "Default")
        monitors = group.get("monitors", [])

        logger.info("Processing group: %s", group_name)

        for mon in monitors:
            name = mon["name"]
            url = mon["url"]
            m_type_str = mon.get("type", "http")
            m_type = get_monitor_type(m_type_str)

            # Common parameters
            params = {
                "type": m_type,
                "name": name,
                "url": url,
                "interval": mon.get("interval", 60),
                "retryInterval": mon.get("retryInterval", 60),
                "maxretries": mon.get("maxretries", 3),
            }

            if m_type == MonitorType.KEYWORD:
                params["keyword"] = mon.get("keyword")

            try:
                if name in existing_map:
                    logger.info("  - Updating monitor: %s", name)
                    existing_id = existing_map[name]["id"]
                    api.edit_monitor(existing_id, **params)
                else:
                    logger.info("  - Creating monitor: %s", name)
                    api.add_monitor(**params)
            except Exception:  # pylint: disable=broad-except
                logger.exception("    Error processing %s", name)


def main() -> None:
    """Execute the main provisioning logic."""
    if not USERNAME or not PASSWORD:
        logger.error("Error: UPTIME_KUMA_USER and UPTIME_KUMA_PASS environment variables must be set.")
        sys.exit(1)

    logger.info("Connecting to Uptime Kuma at %s...", URL)
    try:
        api = UptimeKumaApi(URL)
        api.login(USERNAME, PASSWORD)
        logger.info("Login successful.")

        config = load_config(YAML_FILE)
        provision_monitors(api, config)

        logger.info("\nProvisioning complete!")
        logger.info("Note: Notification channels must be configured manually or via separate script logic.")

        api.disconnect()

    except Exception:  # pylint: disable=broad-except
        logger.exception("An unexpected error occurred")
        sys.exit(1)


if __name__ == "__main__":
    main()
