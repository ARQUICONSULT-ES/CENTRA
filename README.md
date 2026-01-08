# CENTRA

Next.js 16 application that manages Business Central applications, GitHub repositories, customers, tenants, and environments with automatic synchronization.

## 🚀 Features

- **Business Central Integration**: Sync environments and installed applications from BC Admin API
- **GitHub Integration**: Sync applications from GitHub repositories (automatic `app.json` detection)
- **Customer Management**: Multi-tenant customer and environment management
- **Advanced Permissions**: Role-based access control with granular customer access
- **Automatic Sync**: Daily cron job synchronization (7:00 AM UTC)

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database
- GitHub account with organization access
- Business Central Admin API access (Azure AD app registration)

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/ARQUICONSULT-ES/Github-Manager.git
cd Github-Manager

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🔐 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Business Central
BC_ADMIN_API_URL=https://api.businesscentral.dynamics.com/admin/v2.28/applications

# Cron Job Security
CRON_SECRET=your-secure-random-token

# GitHub Admin Token (for automatic sync)
GITHUB_ADMIN_TOKEN=ghp_your_github_admin_token
```

See [`.env.example`](.env.example) for complete configuration.

## ⏰ Automatic Synchronization

The application includes a Vercel Cron Job that runs daily at 7:00 AM UTC to synchronize:

1. **Business Central Environments** - All configured tenants
2. **Installed Applications** - All active environments
3. **GitHub Applications** - All repositories with `app.json`

### Setup Cron Job

1. Configure environment variables in Vercel:
   - `CRON_SECRET` - Generate with: `openssl rand -base64 32`
   - `GITHUB_ADMIN_TOKEN` - GitHub Personal Access Token with `repo` and `read:org` scopes

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

3. Verify cron job in Vercel Dashboard → Settings → Crons

📖 **Detailed Guide**: See [docs/CRON_JOB_SETUP.md](docs/CRON_JOB_SETUP.md)

## 📚 Documentation

- [Technical Documentation](.github/copilot-instructions.md) - Complete technical reference
- [Cron Job Setup Guide](docs/CRON_JOB_SETUP.md) - Automatic synchronization configuration

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM 7.x
- **Authentication**: NextAuth.js 4.x
- **Styling**: Tailwind CSS 4.x
- **External APIs**: GitHub API v3, Business Central Admin API v2.28

## 🚀 Deployment

### Deploy to Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Important**: Configure environment variables in Vercel Dashboard before deploying.

## 📖 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

## 🤝 Contributing

This is a private repository for ARQUICONSULT-ES.

## 📄 License

Private - All rights reserved.
