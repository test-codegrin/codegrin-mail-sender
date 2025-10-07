# Bolt Mail Admin

A full-featured mail administration application built with Next.js (Pages Router) that allows you to manage SMTP settings, create email templates, and send emails through a secure JWT-authenticated interface.

## Features

- **JWT Authentication**: Secure login with bcrypt password hashing
- **SMTP Configuration**: Configure and test SMTP server settings
- **Email Templates**: Create, manage, and reuse email templates
- **Email Composer**: Send emails using saved SMTP configuration and templates
- **File-Based Storage**: Simple JSON file storage (easily replaceable with database)
- **Health Check**: Basic API health monitoring endpoint

## Project Structure

```
bolt-mail-admin-next/
├── pages/
│   ├── api/
│   │   ├── admin/
│   │   │   └── change-password.ts    # Change admin password (protected)
│   │   ├── smtp/
│   │   │   ├── index.ts              # Get/Save SMTP config (protected)
│   │   │   └── test.ts               # Test SMTP connection (protected)
│   │   ├── health.ts                 # Health check endpoint
│   │   ├── login.ts                  # User login
│   │   ├── send.ts                   # Send email (protected)
│   │   └── templates.ts              # CRUD templates (protected)
│   ├── index.tsx                     # Login page
│   ├── smtp-settings.tsx             # SMTP & template management
│   └── compose.tsx                   # Compose & send emails
├── lib/
│   ├── auth.ts                       # JWT utilities & middleware
│   └── store.ts                      # File-based JSON storage
├── data/
│   └── store.json                    # Auto-generated data store
└── .env                              # Environment variables (create from .env.example)
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
# JWT Secret (use a strong random string in production)
JWT_SECRET=your-secret-key-change-this-in-production

# Default Admin Credentials (used on first run)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme123

# Node Environment
NODE_ENV=development
```

**IMPORTANT**: Change `JWT_SECRET` and `ADMIN_PASSWORD` before deploying to production!

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. First Login

Use the credentials from your `.env` file:
- Email: `admin@example.com` (or your configured email)
- Password: `changeme123` (or your configured password)

### 5. Configure SMTP

1. Navigate to "SMTP Settings"
2. Enter your SMTP server details (host, port, credentials)
3. Test the connection
4. Save configuration

### 6. Start Sending Emails

1. Create templates (optional) in the Templates tab
2. Go to "Compose" to send emails
3. Select a template or write from scratch

## API Endpoints

### Public Endpoints

- `POST /api/login` - Authenticate and receive JWT
- `GET /api/health` - Check API status

### Protected Endpoints (require Bearer token)

- `POST /api/admin/change-password` - Change admin password
- `GET /api/smtp` - Get SMTP configuration (password masked)
- `POST /api/smtp` - Save SMTP configuration
- `POST /api/smtp/test` - Test SMTP connection
- `POST /api/send` - Send email
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create new template
- `DELETE /api/templates?id={id}` - Delete template

### Example API Usage

```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme123"}'

# Send email (with token)
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "<p>Hello World!</p>"
  }'
```

## Security Considerations

### Critical Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Change default credentials** - Update `JWT_SECRET` and `ADMIN_PASSWORD` in production
3. **Use strong passwords** - Minimum 8 characters, mix of letters, numbers, symbols
4. **HTTPS in production** - Always use SSL/TLS in production environments
5. **Secure JWT_SECRET** - Use a cryptographically random string (at least 32 characters)
6. **SMTP credentials** - Stored in plain text in JSON file (see migration notes below)
7. **Rate limiting** - Consider adding rate limiting to API routes in production
8. **CORS** - Configure CORS headers appropriately for your frontend domain

### Recommended Production Setup

```env
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Use environment variables for sensitive data
ADMIN_EMAIL=secure-admin@yourdomain.com
ADMIN_PASSWORD=$(openssl rand -base64 16)
NODE_ENV=production
```

## Migrating from File Storage to Database

The application currently uses a file-based JSON store (`./data/store.json`). To migrate to a database:

### 1. Replace `lib/store.ts`

Current file operations can be swapped with database calls:

```typescript
// BEFORE: File-based
export async function getStore(): Promise<Store> {
  const data = fs.readFileSync(STORE_FILE, 'utf-8');
  return JSON.parse(data);
}

// AFTER: Database (example with Supabase)
export async function getStore(): Promise<Store> {
  const { data: user } = await supabase.from('users').select('*').single();
  const { data: smtp } = await supabase.from('smtp_config').select('*').maybeSingle();
  const { data: templates } = await supabase.from('templates').select('*');
  return { user, smtp, templates };
}
```

### 2. Use a Secret Manager for SMTP Credentials

Instead of storing SMTP passwords in the database:

```typescript
// Example with AWS Secrets Manager, HashiCorp Vault, etc.
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const secretsManager = new SecretsManager({ region: 'us-east-1' });

async function getSMTPPassword() {
  const secret = await secretsManager.getSecretValue({ SecretId: 'smtp-password' });
  return secret.SecretString;
}
```

### 3. Database Schema Example

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMTP configuration table
CREATE TABLE smtp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  secure BOOLEAN DEFAULT false,
  user TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,  -- Encrypt before storing
  from_name TEXT,
  from_email TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Common SMTP Configurations

### Gmail
```
Host: smtp.gmail.com
Port: 587 (or 465 for SSL)
Secure: Yes (for 465) / No (for 587 with STARTTLS)
User: your-email@gmail.com
Password: App Password (not your Gmail password)
```

**Note**: You need to create an [App Password](https://support.google.com/accounts/answer/185833) for Gmail.

### SendGrid
```
Host: smtp.sendgrid.net
Port: 587
Secure: No
User: apikey
Password: Your SendGrid API Key
```

### Mailgun
```
Host: smtp.mailgun.org
Port: 587
Secure: No
User: postmaster@your-domain.mailgun.org
Password: Your Mailgun SMTP Password
```

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run typecheck

# Lint code
npm run lint
```

## Troubleshooting

### "SMTP connection failed"
- Verify your SMTP credentials are correct
- Check if your email provider requires app-specific passwords
- Ensure firewall allows outbound connections on SMTP port
- Try toggling the "Use SSL/TLS" option

### "Invalid or expired token"
- Your JWT token may have expired (7-day expiration)
- Log out and log back in to get a new token

### "Email not sending"
- Test SMTP connection first
- Check SMTP configuration is saved
- Verify recipient email address is valid
- Check your SMTP provider's sending limits

## License

MIT

## Contributing

This is a demonstration project. Feel free to fork and modify for your needs.

## Security Disclosure

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.
