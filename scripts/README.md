# Database Maintenance Scripts

This directory contains scripts for database maintenance and migrations.

## fix-multi-tenant.ts

Fixes multi-tenant structure for existing users who were created before the multi-tenant system was implemented.

### What it does:

1. **Finds users without organization membership** and creates:
   - A default organization (e.g., "John's Workspace")
   - An organization membership with OWNER role
   - Links all their bots to the new organization

2. **Finds orphaned bots** (bots without organizationId) and:
   - Links them to their creator's organization

### When to run:

- After upgrading from single-tenant to multi-tenant architecture
- When users report "User has no organization" errors
- When documents API returns 403 with "NO_ORGANIZATION" code

### How to run:

```bash
# From the project root
cd /home/user/Chatbot

# Set DATABASE_URL environment variable
export DATABASE_URL="your-database-url"

# Run the script
npx tsx scripts/fix-multi-tenant.ts
```

### Safe to run multiple times:

Yes! The script checks for existing organizations and memberships before creating new ones.

### Output example:

```
🔧 Starting multi-tenant fix...

📊 Found 3 users without organization

👤 Processing user: john@example.com
   ✅ Created organization: John's Workspace (cm123...)
   ✅ Created membership with OWNER role
   ✅ Updated 2 bot(s) to organization

==================================================
✨ Multi-tenant fix complete!
==================================================
✅ Fixed: 5
❌ Errors: 0
==================================================
```

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

Run:
```bash
npm install
cd packages/database && npx prisma generate
```

### Error: "Environment variable not found: DATABASE_URL"

Make sure you set the DATABASE_URL before running:
```bash
export DATABASE_URL="postgresql://..."
```

Or use a `.env` file in the project root.
