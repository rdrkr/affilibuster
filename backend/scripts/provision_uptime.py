#!/usr/bin/env python3  # noqa: EXE001
# Copyright (c) 2026 Affilibuster by Ronen Druker.

"""
Uptime Kuma Provisioning Script.

Syncs monitors from uptime-kuma-monitors.yaml to a running Uptime Kuma instance.
"""

import contextlib
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any

import yaml
from uptime_kuma_api import MonitorType, NotificationType, UptimeKumaApi

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


def provision_notifications(api: UptimeKumaApi, config: dict[str, Any]) -> dict[str, int]:
    """
    Provision notification channels based on configuration.

    Args:
        api: Authenticated UptimeKumaApi instance.
        config: Configuration dictionary.

    Returns:
        dict: Mapping of notification name to notification ID.

    """
    notifications = config.get("notifications", [])
    if not notifications:
        logger.info("No notifications configured.")
        return {}

    logger.info("Fetching existing notifications...")
    existing_notifications = api.get_notifications()
    existing_map = {n["name"]: n for n in existing_notifications}
    name_to_id: dict[str, int] = {}

    for notif in notifications:
        name = notif["name"]
        notif_type = notif.get("type", "").lower()

        if notif_type == "telegram":
            bot_token = os.getenv("UPTIME_KUMA_TELEGRAM_BOT_TOKEN", "")
            chat_id = os.getenv("UPTIME_KUMA_TELEGRAM_CHAT_ID", "")

            if not bot_token or not chat_id:
                logger.error(
                    "  Telegram notification '%s' requires "
                    "UPTIME_KUMA_TELEGRAM_BOT_TOKEN and "
                    "UPTIME_KUMA_TELEGRAM_CHAT_ID environment variables.",
                    name,
                )
                continue

            params: dict[str, Any] = {
                "name": name,
                "type": NotificationType.TELEGRAM,
                "telegramBotToken": bot_token,
                "telegramChatID": chat_id,
                "isDefault": notif.get("isDefault", False),
                "applyExisting": notif.get("applyExisting", False),
            }

            try:
                if name in existing_map:
                    logger.info("  - Updating notification: %s", name)
                    existing_id = existing_map[name]["id"]
                    api.edit_notification(existing_id, **params)
                    name_to_id[name] = existing_id
                else:
                    logger.info("  - Creating notification: %s", name)
                    result = api.add_notification(**params)
                    name_to_id[name] = result["id"]
            except Exception:  # pylint: disable=broad-except
                logger.exception("    Error processing notification %s", name)
        else:
            logger.warning("  Unsupported notification type '%s' for '%s'.", notif_type, name)

    return name_to_id


def provision_monitors(
    api: UptimeKumaApi,
    config: dict[str, Any],
    notification_id_map: dict[str, int],
) -> None:
    """
    Provision monitors based on configuration.

    Args:
        api: Authenticated UptimeKumaApi instance.
        config: Configuration dictionary.
        notification_id_map: Mapping of notification name to notification ID.

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
            params: dict[str, Any] = {
                "type": m_type,
                "name": name,
                "url": url,
                "interval": mon.get("interval", 60),
                "retryInterval": mon.get("retryInterval", 60),
                "maxretries": mon.get("maxretries", 3),
            }

            if m_type == MonitorType.KEYWORD:
                params["keyword"] = mon.get("keyword")

            # Attach notification IDs
            notif_names = mon.get("notificationNames", [])
            if notif_names:
                notif_id_list: dict[int, bool] = {}
                for notif_name in notif_names:
                    if notif_name in notification_id_map:
                        notif_id_list[notification_id_map[notif_name]] = True
                    else:
                        logger.warning(
                            "    Notification '%s' not found for monitor '%s'.",
                            notif_name,
                            name,
                        )
                if notif_id_list:
                    params["notificationIDList"] = notif_id_list

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

    # Retry logic for connection and provisioning
    max_retries = 5
    retry_delay = 5  # seconds

    for attempt in range(1, max_retries + 1):
        try:
            # Increase timeout to 60s to handle slow CI environments
            api = UptimeKumaApi(URL, timeout=60)
            api.login(USERNAME, PASSWORD)
            logger.info("Login successful.")

            config = load_config(YAML_FILE)
            notification_id_map = provision_notifications(api, config)
            provision_monitors(api, config, notification_id_map)

            logger.info("\nProvisioning complete!")
            api.disconnect()
            sys.exit(0)  # Success

        except Exception as e:  # pylint: disable=broad-except
            logger.warning("Attempt %d/%d failed: %s", attempt, max_retries, e)
            if "api" in locals():
                with contextlib.suppress(Exception):
                    api.disconnect()

            if attempt < max_retries:
                logger.info("Retrying in %d seconds...", retry_delay)
                time.sleep(retry_delay)
            else:
                logger.exception("Max retries reached. Exiting.")
                sys.exit(1)


if __name__ == "__main__":
    main()
