#!/usr/bin/env bash
# Copyright (c) 2026 Affilibuster by Ronen Druker.
#
# VPS Setup Script - Server Hardening & Docker Installation
# ==================================================================
#
# This script automates Phase 1 of the VPS migration:
#   - Creates 'deploy' user with SSH key authentication
#   - Hardens SSH configuration (no root login, no password auth)
#   - Configures UFW firewall (ports 22, 80, 443 only)
#   - Installs fail2ban for SSH brute-force protection
#   - Sets up unattended-upgrades for automatic security patches
#   - Creates 4GB swap file as memory safety net
#   - Installs Docker Engine + Compose plugin
#
# Usage:
#   Run as root on a fresh Ubuntu 24.04 VPS:
#     curl -fsSL https://raw.githubusercontent.com/rdrkr/affilibuster/main/scripts/setup-vps.sh | bash
#   Or:
#     scp scripts/setup-vps.sh root@<vps-ip>:/root/
#     ssh root@<vps-ip> 'bash /root/setup-vps.sh'
#
# After running:
#   1. SSH as deploy user: ssh deploy@<vps-ip>
#   2. Clone repo: git clone https://github.com/rdrkr/affilibuster.git
#   3. Create .env.prod from .env.prod.example and fill in secrets
#
# Requirements:
#   - Ubuntu 24.04 LTS (tested on Hetzner Cloud)
#   - Root access
#   - SSH key already added to (for root access)

set -euo pipefail

# Configuration
DEPLOY_USER="deploy"
SWAP_SIZE_GB=4

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
check_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    log_error "This script must be run as root"
    exit 1
  fi
}

# Update system packages
update_system() {
  log_info "Updating system packages..."
  apt-get update -qq
  apt-get upgrade -y -qq
  log_success "System packages updated"
}

# Create deploy user with sudo privileges
create_deploy_user() {
  if id "${DEPLOY_USER}" &>/dev/null; then
    log_warn "User '${DEPLOY_USER}' already exists, skipping creation"
  else
    log_info "Creating user '${DEPLOY_USER}' with sudo privileges..."
    adduser --disabled-password --gecos "" "${DEPLOY_USER}"
    usermod -aG sudo "${DEPLOY_USER}"
    log_success "User '${DEPLOY_USER}' created"
  fi

  # Copy SSH keys from root to deploy user
  DEPLOY_SSH_DIR="/home/${DEPLOY_USER}/.ssh"
  if [[ -f /root/.ssh/authorized_keys ]]; then
    log_info "Copying SSH keys to ${DEPLOY_USER}..."
    mkdir -p "${DEPLOY_SSH_DIR}"
    cp /root/.ssh/authorized_keys "${DEPLOY_SSH_DIR}/"
    chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_SSH_DIR}"
    chmod 700 "${DEPLOY_SSH_DIR}"
    chmod 600 "${DEPLOY_SSH_DIR}/authorized_keys"
    log_success "SSH keys copied"
  else
    log_warn "No SSH keys found in /root/.ssh/authorized_keys"
    log_warn "You'll need to manually add SSH keys for '${DEPLOY_USER}'"
  fi

  # Allow deploy user to run sudo without password (for Docker commands)
  if [[ ! -f "/etc/sudoers.d/${DEPLOY_USER}" ]]; then
    log_info "Configuring passwordless sudo for ${DEPLOY_USER}..."
    echo "${DEPLOY_USER} ALL=(ALL) NOPASSWD:ALL" >"/etc/sudoers.d/${DEPLOY_USER}"
    chmod 440 "/etc/sudoers.d/${DEPLOY_USER}"
    log_success "Passwordless sudo configured"
  fi
}

# Harden SSH configuration
harden_ssh() {
  log_info "Hardening SSH configuration..."

  local sshd_config="/etc/ssh/sshd_config"
  local backup_config="/etc/ssh/sshd_config.backup"

  # Backup original config
  if [[ ! -f "${backup_config}" ]]; then
    cp "${sshd_config}" "${backup_config}"
  fi

  # Disable root login
  sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' "${sshd_config}"

  # Disable password authentication
  sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' "${sshd_config}"

  # Disable empty passwords
  sed -i 's/^#*PermitEmptyPasswords.*/PermitEmptyPasswords no/' "${sshd_config}"

  # Enable pubkey authentication
  sed -i 's/^#*PubkeyAuthentication.*/PubkeyAuthentication yes/' "${sshd_config}"

  # Restart SSH service (Ubuntu uses 'ssh', not 'sshd')
  systemctl restart ssh

  log_success "SSH hardened (root login disabled, password auth disabled)"
}

# Configure UFW firewall
configure_ufw() {
  log_info "Configuring UFW firewall..."

  # Install UFW if not present
  if ! command -v ufw &>/dev/null; then
    apt-get install -y -qq ufw
  fi

  # Reset UFW to defaults
  ufw --force reset >/dev/null

  # Default policies
  ufw default deny incoming >/dev/null
  ufw default allow outgoing >/dev/null

  # Allow SSH (port 22)
  ufw allow ssh >/dev/null

  # Allow HTTP (port 80) for Caddy
  ufw allow 80/tcp >/dev/null

  # Allow HTTPS (port 443) for Caddy
  ufw allow 443/tcp >/dev/null

  # Enable UFW
  ufw --force enable >/dev/null

  log_success "UFW configured (ports 22, 80, 443 open)"
}

# Install and configure fail2ban
install_fail2ban() {
  log_info "Installing fail2ban..."

  apt-get install -y -qq fail2ban

  # Detect current SSH connection IP to whitelist
  local current_ip=""
  if [[ -n "${SSH_CLIENT:-}" ]]; then
    current_ip=$(echo "${SSH_CLIENT}" | awk '{print $1}')
    log_info "Detected your IP: ${current_ip} (will be whitelisted)"
  fi

  # Create local jail config with IP whitelist
  local jail_local="/etc/fail2ban/jail.local"
  cat >"${jail_local}" <<EOF
[DEFAULT]
bantime = 1h
maxretry = 5
findtime = 10m
# Whitelist localhost and the IP running this setup script
ignoreip = 127.0.0.1/8 ::1 ${current_ip}

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h
EOF

  # Restart fail2ban
  systemctl enable fail2ban
  systemctl restart fail2ban

  if [[ -n "${current_ip}" ]]; then
    log_success "fail2ban installed (your IP ${current_ip} is whitelisted)"
  else
    log_success "fail2ban installed and configured"
  fi
}

# Configure unattended-upgrades
configure_unattended_upgrades() {
  log_info "Configuring automatic security updates..."

  apt-get install -y -qq unattended-upgrades

  # Enable unattended upgrades
  local auto_upgrades="/etc/apt/apt.conf.d/20auto-upgrades"
  cat >"${auto_upgrades}" <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

  log_success "Automatic security updates enabled"
}

# Create swap file
create_swap() {
  local swap_file="/swapfile"
  local swap_size="${SWAP_SIZE_GB}G"

  if [[ -f "${swap_file}" ]]; then
    log_warn "Swap file already exists, skipping"
    return
  fi

  log_info "Creating ${swap_size} swap file..."

  # Create swap file
  fallocate -l "${swap_size}" "${swap_file}"
  chmod 600 "${swap_file}"
  mkswap "${swap_file}" >/dev/null
  swapon "${swap_file}"

  # Add to fstab for persistence
  if ! grep -q "${swap_file}" /etc/fstab; then
    echo "${swap_file} none swap sw 0 0" >>/etc/fstab
  fi

  # Tune swappiness (prefer RAM, use swap as safety net)
  sysctl -q vm.swappiness=10
  echo "vm.swappiness=10" >/etc/sysctl.d/99-swappiness.conf

  log_success "${swap_size} swap file created"
}

# Install Docker Engine + Compose
install_docker() {
  if command -v docker &>/dev/null; then
    log_warn "Docker already installed, skipping"
  else
    log_info "Installing Docker Engine..."

    # Install prerequisites
    apt-get install -y -qq ca-certificates curl gnupg

    # Add Docker's official GPG key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # Add Docker repository
    # shellcheck source=/dev/null disable=SC2154
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" |
      tee /etc/apt/sources.list.d/docker.list >/dev/null

    # Install Docker
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    log_success "Docker Engine installed"
  fi

  # Add deploy user to docker group
  if ! groups "${DEPLOY_USER}" | grep -q docker; then
    log_info "Adding ${DEPLOY_USER} to docker group..."
    usermod -aG docker "${DEPLOY_USER}"
    log_success "${DEPLOY_USER} added to docker group"
  fi

  # Enable and start Docker
  systemctl enable docker
  systemctl start docker
}

# Install additional utilities
install_utilities() {
  log_info "Installing additional utilities..."
  apt-get install -y -qq git htop ncdu make
  log_success "Utilities installed (git, htop, ncdu, make)"

  # Install lazygit from GitHub releases
  if command -v lazygit &>/dev/null; then
    log_warn "lazygit already installed, skipping"
  else
    log_info "Installing lazygit..."
    local lazygit_version
    lazygit_version=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": *"v\K[^"]*')
    curl -Lo /tmp/lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/download/v${lazygit_version}/lazygit_${lazygit_version}_Linux_x86_64.tar.gz"
    tar xf /tmp/lazygit.tar.gz -C /tmp lazygit
    install /tmp/lazygit -D -t /usr/local/bin/
    rm -f /tmp/lazygit.tar.gz /tmp/lazygit
    log_success "lazygit installed"
  fi

  # Install lazydocker
  if command -v lazydocker >/dev/null 2>&1; then
    log_warn "lazydocker already installed, skipping"
  else
    log_info "Installing lazydocker..."
    local lazydocker_version
    lazydocker_version=$(curl -s "https://api.github.com/repos/jesseduffield/lazydocker/releases/latest" | grep -Po '"tag_name": *"v\K[^"]*')
    curl -Lo /tmp/lazydocker.tar.gz "https://github.com/jesseduffield/lazydocker/releases/download/v${lazydocker_version}/lazydocker_${lazydocker_version}_Linux_x86_64.tar.gz"
    tar xf /tmp/lazydocker.tar.gz -C /tmp lazydocker
    install /tmp/lazydocker -D -t /usr/local/bin/
    rm -f /tmp/lazydocker.tar.gz /tmp/lazydocker
    log_success "lazydocker installed"
  fi
}

# Clean up
cleanup() {
  log_info "Cleaning up..."
  apt-get autoremove -y -qq
  apt-get clean -qq
  log_success "Cleanup complete"
}

# Print summary
print_summary() {
  echo ""
  echo "=========================================="
  echo -e "${GREEN}✅ VPS SETUP COMPLETE${NC}"
  echo "=========================================="
  echo ""
  echo "Next steps:"
  echo "  1. Test SSH as deploy user:"
  echo "     ssh ${DEPLOY_USER}@<this-server-ip>"
  echo ""
  echo "  2. Clone the repo:"
  echo "     git clone https://github.com/rdrkr/affilibuster.git"
  echo "     cd affilibuster"
  echo ""
  echo "  3. Create .env.prod:"
  echo "     cp .env.prod.example .env.prod"
  echo "     nano .env.prod  # Fill in secrets from Render"
  echo ""
  echo "  4. Start production services:"
  echo "     docker compose -f docker-compose.prod.yaml up -d"
  echo ""
  echo -e "  5. ${YELLOW}Add the deploy key to GitHub:${NC}"
  echo "     Go to: https://github.com/rdrkr/affilibuster/settings/keys"
  echo "     Click 'Add deploy key', paste the public key above, and check 'Allow write access'"
  echo ""
  echo "Security summary:"
  echo "  - SSH: Root login disabled, password auth disabled"
  echo "  - Firewall: Only ports 22, 80, 443 open"
  echo "  - fail2ban: SSH brute-force protection (24h ban)"
  echo "  - Auto-updates: Security patches applied automatically"
  echo "  - Swap: ${SWAP_SIZE_GB}GB as memory safety net"
  echo "  - Backup: Daily at 3 AM UTC (Strapi + PostgreSQL + git push)"
  echo ""
  echo -e "${YELLOW}⚠️  IMPORTANT: Test SSH as '${DEPLOY_USER}' before closing this session!${NC}"
  echo ""
}

# Clone repo and run development setup as deploy user
run_dev_setup() {
  log_info "Cloning repository and setting up development tools..."

  # Clone repo if not exists
  local repo_dir="/home/${DEPLOY_USER}/affilibuster"
  if [[ -d "${repo_dir}" ]]; then
    log_warn "Repository already exists at ${repo_dir}, skipping clone"
  else
    sudo -u "${DEPLOY_USER}" git clone https://github.com/rdrkr/affilibuster.git "${repo_dir}"
    log_success "Repository cloned to ${repo_dir}"
  fi

  # Run setup.sh with --skip-ssl as deploy user
  log_info "Running development setup (skipping SSL certificates)..."
  cd "${repo_dir}"
  sudo -u "${DEPLOY_USER}" bash scripts/setup.sh --skip-ssl

  log_success "Development tools installed"
}

# Setup SSH deploy key for backup git push
setup_deploy_key() {
  log_info "Setting up SSH deploy key for backup..."

  local deploy_home="/home/${DEPLOY_USER}"
  local key_file="${deploy_home}/.ssh/backup_key"
  local ssh_config="${deploy_home}/.ssh/config"
  local repo_dir="${deploy_home}/affilibuster"

  # Generate deploy key if it doesn't exist
  if [[ -f "${key_file}" ]]; then
    log_warn "Deploy key already exists at ${key_file}, skipping generation"
  else
    log_info "Generating SSH deploy key..."
    sudo -u "${DEPLOY_USER}" ssh-keygen -t ed25519 -C "affilibuster-backup" -f "${key_file}" -N ""
    log_success "Deploy key generated"
  fi

  # Configure SSH to use the deploy key for GitHub
  if [[ -f "${ssh_config}" ]] && grep -qF "affilibuster-backup" "${ssh_config}"; then
    log_warn "SSH config for GitHub deploy key already exists, skipping"
  else
    cat >>"${ssh_config}" <<EOF

# GitHub deploy key for backup git push
Host github.com
  HostName github.com
  User git
  IdentityFile ${key_file}
  IdentitiesOnly yes
EOF
    chown "${DEPLOY_USER}:${DEPLOY_USER}" "${ssh_config}"
    chmod 600 "${ssh_config}"
    log_success "SSH config updated for GitHub deploy key"
  fi

  # Switch git remote to SSH (if repo exists and uses HTTPS)
  if [[ -d "${repo_dir}/.git" ]]; then
    local current_remote
    current_remote=$(sudo -u "${DEPLOY_USER}" git -C "${repo_dir}" remote get-url origin 2>/dev/null || true)
    if [[ "${current_remote}" == https://* ]]; then
      sudo -u "${DEPLOY_USER}" git -C "${repo_dir}" remote set-url origin git@github.com:rdrkr/affilibuster.git
      log_success "Git remote switched from HTTPS to SSH"
    else
      log_warn "Git remote already uses SSH, skipping"
    fi
  fi

  # Print the public key for the user to add to GitHub
  echo ""
  echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}  ADD THIS DEPLOY KEY TO GITHUB (with write access):${NC}"
  echo -e "${YELLOW}  https://github.com/rdrkr/affilibuster/settings/keys${NC}"
  echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
  echo ""
  cat "${key_file}.pub"
  echo ""
  echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
  echo ""
}

# Setup daily backup cron job + logrotate
setup_backup_cron() {
  log_info "Setting up daily backup cron job..."

  local backup_script="/home/${DEPLOY_USER}/affilibuster/scripts/backup.sh"
  local backup_log="/var/log/affilibuster-backup.log"
  local cron_entry="0 3 * * * ${backup_script} >> ${backup_log} 2>&1"

  # Create log file with correct ownership
  touch "${backup_log}"
  chown "${DEPLOY_USER}:${DEPLOY_USER}" "${backup_log}"

  # Create backup directory
  mkdir -p /mnt/backups/postgres
  chown "${DEPLOY_USER}:${DEPLOY_USER}" /mnt/backups/postgres

  # Install cron job for deploy user (idempotent)
  local existing_cron
  existing_cron=$(crontab -u "${DEPLOY_USER}" -l 2>/dev/null || true)
  if echo "${existing_cron}" | grep -qF "backup.sh"; then
    log_warn "Backup cron job already exists, skipping"
  else
    (
      echo "${existing_cron}"
      echo "${cron_entry}"
    ) | crontab -u "${DEPLOY_USER}" -
    log_success "Backup cron job installed (daily at 3 AM UTC)"
  fi

  # Setup logrotate
  cat >/etc/logrotate.d/affilibuster-backup <<EOF
${backup_log} {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    create 644 ${DEPLOY_USER} ${DEPLOY_USER}
}
EOF

  log_success "Logrotate configured for backup logs"
}

# Main execution
main() {
  echo ""
  echo "=========================================="
  echo "Affilibuster VPS Setup"
  echo "=========================================="
  echo ""

  check_root
  update_system
  create_deploy_user
  harden_ssh
  configure_ufw
  install_fail2ban
  configure_unattended_upgrades
  create_swap
  install_docker
  install_utilities
  run_dev_setup
  setup_deploy_key
  setup_backup_cron
  cleanup
  print_summary
}

main "$@"
