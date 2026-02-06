<!-- Copyright (c) 2026 Affilibuster by Ronen Druker. -->

# Phase 1: Hetzner VPS Setup Guide

Step-by-step guide for setting up a Hetzner VPS for the Affilibuster production environment.

---

## 1. Create Hetzner Cloud Server

### 1.1 Sign Up / Log In

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Create account or log in

### 1.2 Add Your SSH Key

1. Navigate to **Security** → **SSH Keys**
2. Click **Add SSH Key**
3. Paste your public key (usually `~/.ssh/id_ed25519.pub` or `~/.ssh/id_rsa.pub`)
4. Name it (e.g., "MacBook Pro")

### 1.3 Create Server

1. Click **Add Server**
2. **Location**: Frankfurt (EU) or your preferred region
3. **Image**: Ubuntu 24.04 LTS
4. **Type**: CX33 (4 vCPU, 8GB RAM, 80GB NVMe) - ~€6.59/month
5. **SSH Keys**: Select your key from step 1.2
6. **Name**: `affilibuster-prod`
7. Click **Create & Buy Now**

> [!NOTE]
> The CX33 provides excellent value with 4 vCPUs and 8GB RAM for ~€6.59/month.
> See [pricing](https://www.hetzner.com/cloud).

### 1.4 Enable Backups (Optional)

1. Go to server details
2. Click **Backups** tab
3. Enable automatic backups (+20% ≈ €1.32/month)

---

## 2. Initial Server Access

### 2.1 Get Server IP

Copy the IPv4 address from the Hetzner Cloud Console.

### 2.2 Test SSH Access

```bash
ssh root@<server-ip>
```

You should connect without a password prompt (using your SSH key).

---

## 3. Run Setup Script

The setup script automates server hardening and Docker installation.

### Option A: Run Directly from GitHub

```bash
curl -fsSL https://raw.githubusercontent.com/rdrkr/affilibuster/main/scripts/setup-vps.sh | bash
```

### Option B: Copy and Run Manually

```bash
# From your local machine
scp scripts/setup-vps.sh root@<server-ip>:/root/

# On the server
ssh root@<server-ip>
bash /root/setup-vps.sh
```

### What the Script Does

| Step                 | Description                                           |
| -------------------- | ----------------------------------------------------- |
| Create `deploy` user | New user with sudo privileges, SSH keys copied        |
| Harden SSH           | Disable root login, disable password auth             |
| Configure UFW        | Firewall: allow ports 22, 80, 443 only                |
| Install fail2ban     | SSH brute-force protection (24h ban after 3 attempts) |
| Enable auto-updates  | Automatic security patches via unattended-upgrades    |
| Create 4GB swap      | Memory safety net                                     |
| Install Docker       | Docker Engine + Compose plugin                        |

> [!CAUTION]
> After the script completes, **test SSH as `deploy` user before closing your root session!**
>
> ```bash
> # In a new terminal
> ssh deploy@<server-ip>
> ```
>
> If this fails, you still have root access to fix it.

---

## 4. Extract Render Secrets

Before migrating, extract these secrets from [Render Dashboard](https://dashboard.render.com/):

### CMS (Strapi) Secrets

| Variable                   | Where to Find                      |
| -------------------------- | ---------------------------------- |
| `ADMIN_JWT_SECRET`         | CMS service → Environment → Reveal |
| `API_TOKEN_SALT`           | CMS service → Environment → Reveal |
| `API_TOKEN_ENCRYPTION_KEY` | CMS service → Environment → Reveal |
| `TRANSFER_TOKEN_SALT`      | CMS service → Environment → Reveal |
| `APP_KEYS`                 | CMS service → Environment → Reveal |

### Backend Secrets

| Variable     | Where to Find                          |
| ------------ | -------------------------------------- |
| `JWT_SECRET` | Backend service → Environment → Reveal |

### Frontend Secrets

| Variable            | Where to Find                           |
| ------------------- | --------------------------------------- |
| `REVALIDATE_SECRET` | Frontend service → Environment → Reveal |

### External Services

| Variable            | Where to Find        |
| ------------------- | -------------------- |
| `CLOUDINARY_NAME`   | Cloudinary Dashboard |
| `CLOUDINARY_KEY`    | Cloudinary Dashboard |
| `CLOUDINARY_SECRET` | Cloudinary Dashboard |

> [!IMPORTANT]
> These secrets **MUST match** your current Render values to keep existing API tokens and sessions valid.
> Copy them exactly.

---

## 5. Clone Repo & Configure

### 5.1 SSH as Deploy User

```bash
ssh deploy@<server-ip>
```

### 5.2 Clone Repository

```bash
git clone https://github.com/rdrkr/affilibuster.git
cd affilibuster
```

### 5.3 Generate Production Environment

Run the interactive script to generate `.env.prod`:

```bash
./scripts/generate-env-prod.sh
```

The script will:

- Auto-generate all security secrets (Postgres password, JWT, API tokens, etc.)
- Prompt you for Cloudinary credentials
- Optionally ask for Google Analytics/Tag Manager IDs
- Create a complete `.env.prod` file

> [!TIP]
> Run `./scripts/generate-env-prod.sh --help` to see all options.

**Alternative: Manual Configuration**

If you prefer to use existing Render secrets (to keep sessions/tokens valid):

```bash
cp .env.prod.example .env.prod
nano .env.prod  # Fill in values from Render dashboard
```

---

## 6. Verification Checklist

After completing all steps, verify:

- [ ] SSH works as `deploy` user: `ssh deploy@<server-ip>`
- [ ] Docker is installed: `docker --version`
- [ ] Docker Compose works: `docker compose version`
- [ ] UFW is active: `sudo ufw status` (shows ports 22, 80, 443)
- [ ] fail2ban is running: `sudo systemctl status fail2ban`
- [ ] Swap is active: `free -h` (shows swap)
- [ ] `.env.prod` exists and has all secrets filled in

---

## Next Steps

Once Phase 1 is complete:

1. **Phase 2**: Already complete - Production Docker files exist
2. **Phase 5**: Migrate data from Render (see [plan.md](plan.md))
3. **Phase 4**: Update DNS records to point to Hetzner IP
4. **Phase 6**: Set up backup cron job
5. **Phase 7**: Deploy Uptime Kuma for monitoring
