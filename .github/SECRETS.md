# GitHub Secrets and Variables Configuration

This document describes the required GitHub secrets and variables for running CI/CD workflows.

## Understanding Secrets vs Variables

GitHub provides two types of configuration:

- **Secrets**: Encrypted, never shown in logs. Use for passwords, tokens, API keys.
- **Variables**: Plain text, visible in logs. Use for usernames, URLs, non-sensitive config.

## Required Configuration

The following must be configured in your GitHub repository settings before the CI workflow can run successfully.

### Location

Settings → Secrets and variables → Actions

- For secrets: "Secrets" tab → "New repository secret"
- For variables: "Variables" tab → "New repository variable"

### Configuration List

| Name | Type | Description | Example / Generation Method |
|------|------|-------------|---------------------------|
| `POSTGRES_USER` | Variable | PostgreSQL database username | `affilibuster` |
| `POSTGRES_PASSWORD` | Secret | PostgreSQL database password | `affilibuster_ci_pass` |
| `ADMIN_JWT_SECRET` | Secret | Strapi admin JWT signing secret | `openssl rand -base64 32` |
| `API_TOKEN_SALT` | Secret | Strapi API token salt | `openssl rand -base64 32` |
| `API_TOKEN_ENCRYPTION_KEY` | Secret | Strapi API token encryption key | `openssl rand -base64 32` |
| `TRANSFER_TOKEN_SALT` | Secret | Strapi transfer token salt | `openssl rand -base64 32` |
| `APP_KEYS` | Secret | Strapi app keys (comma-separated, 4 keys) | See generation below |
| `JWT_SECRET` | Secret | Backend JWT signing secret | `openssl rand -base64 32` |
| `REVALIDATE_SECRET` | Secret | Frontend revalidation secret | `openssl rand -base64 32` |
| `EXCHANGE_RATE_API_KEY` | Secret | Exchange rate API key (optional) | Get from https://exchangerate-api.com or use `test-key` |

### Runtime-Generated Values

**`STRAPI_API_TOKEN`** - This is generated automatically by Strapi at runtime. You do NOT need to configure this in GitHub. The CI workflow uses a placeholder value, and Strapi will generate the actual token when it starts.

## Quick Setup Guide

### 1. Generate Secrets

Run the following commands to generate secure random values:

```bash
# Generate individual secrets
echo "ADMIN_JWT_SECRET=$(openssl rand -base64 32)"
echo "API_TOKEN_SALT=$(openssl rand -base64 32)"
echo "API_TOKEN_ENCRYPTION_KEY=$(openssl rand -base64 32)"
echo "TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "REVALIDATE_SECRET=$(openssl rand -base64 32)"

# Generate APP_KEYS (4 comma-separated keys)
echo "APP_KEYS=$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
```

### 2. Add Variables to GitHub

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
3. Click **New repository variable**
4. Add the following variables:
   - Name: `POSTGRES_USER`, Value: `affilibuster`

### 3. Add Secrets to GitHub

For each secret:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions** → **Secrets** tab
3. Click **New repository secret**
4. Enter the **Name** (e.g., `ADMIN_JWT_SECRET`)
5. Paste the generated **Value**
6. Click **Add secret**

Repeat for all secrets listed in the configuration table above.

### 4. Simple Values for CI

For CI/CD environments, you can use these simple values for secrets:

```bash
POSTGRES_PASSWORD=affilibuster_ci_pass
EXCHANGE_RATE_API_KEY=test-key  # Optional, has default fallback
```

**Note**: You do NOT need to set `STRAPI_API_TOKEN` - it's generated automatically at runtime.

### 5. Verify Setup

After adding all configuration (variables and secrets), trigger the workflow by:

- Pushing to a `main`, `develop`, or `claude/**` branch
- Creating a pull request to `main` or `develop`
- Manually triggering via Actions tab → CI → Run workflow

The workflow will validate that all required secrets are defined before proceeding.

## Environment Variables

The CI workflow automatically creates a `.env` file from the configured secrets. The following environment variables are set:

### Infrastructure
- PostgreSQL configuration (host, port, database names)
- Redis configuration (host, port, TTL settings)

### CMS (Strapi)
- Server configuration (protocol, host, port)
- Security tokens and secrets

### Backend (FastAPI)
- Server configuration (protocol, host, port)
- JWT secrets
- Exchange rate API configuration

### Frontend (Next.js)
- Server configuration (protocol, host, port)
- Public API URLs
- Revalidation secrets
- Analytics IDs (optional)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit secrets to version control** - Secrets should only be stored in GitHub's secure secret storage
2. **Use strong, randomly-generated values** - Always use `openssl rand -base64 32` or similar for production secrets
3. **Rotate secrets regularly** - Change all secrets periodically, especially after team member changes
4. **Different secrets per environment** - Use different values for CI, staging, and production
5. **Audit secret access** - Review who has access to repository secrets regularly

## Troubleshooting

### Workflow Fails with "Missing required configuration"

**Problem:** The workflow validation step reports missing configuration.

**Solution:**
1. Check the error message to see which specific items are missing
2. Determine if each should be a secret or variable (see table above)
3. Add the missing configuration to GitHub repository settings
4. Re-run the workflow

**Common Issues:**
- `POSTGRES_USER` should be a **variable**, not a secret
- All JWT secrets, salts, and keys should be **secrets**
- Don't set `STRAPI_API_TOKEN` - it's runtime-generated

### Workflow Fails During Build/Test

**Problem:** Secrets are defined but services fail to start.

**Solution:**
1. Check that secret values are valid (no extra spaces, quotes, or special characters)
2. For `APP_KEYS`, ensure it's exactly 4 comma-separated base64 strings
3. Verify PostgreSQL credentials are correct
4. Check workflow logs for specific error messages

### Need to Update Configuration

**For Secrets:**
1. Go to Settings → Secrets and variables → Actions → **Secrets** tab
2. Click on the secret name
3. Click **Update secret**
4. Enter the new value
5. Click **Update secret**

**For Variables:**
1. Go to Settings → Secrets and variables → Actions → **Variables** tab
2. Click the pencil icon next to the variable
3. Update the value
4. Click **Update variable**

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Managing Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Affilibuster Development Guide](../CLAUDE.md)
- [Environment Configuration](.env.dev.example)
