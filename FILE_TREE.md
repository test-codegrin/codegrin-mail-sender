# Bolt Mail Admin - File Tree

```
bolt-mail-admin-next/
│
├── README.md                          # Comprehensive documentation
├── .env.example                       # Environment variable template
├── .env                               # Your environment variables (not in git)
├── package.json                       # Dependencies & scripts
│
├── data/                              # File-based storage
│   └── store.json                     # Auto-generated JSON store
│
├── lib/                               # Core utilities
│   ├── auth.ts                        # JWT utilities & withAuth middleware
│   ├── store.ts                       # File-based JSON storage functions
│   └── utils.ts                       # General utilities (from shadcn/ui)
│
├── pages/                             # Next.js pages router
│   ├── index.tsx                      # Login page
│   ├── smtp-settings.tsx              # SMTP config & template management
│   ├── compose.tsx                    # Email composer
│   │
│   └── api/                           # API routes
│       ├── health.ts                  # Health check endpoint
│       ├── login.ts                   # User authentication
│       ├── send.ts                    # Send email (protected)
│       ├── templates.ts               # CRUD templates (protected)
│       │
│       ├── admin/
│       │   └── change-password.ts     # Change password (protected)
│       │
│       └── smtp/
│           ├── index.ts               # Get/Save SMTP config (protected)
│           └── test.ts                # Test SMTP connection (protected)
│
└── components/ui/                     # shadcn/ui components (pre-installed)
    └── [various UI components]
```

## Key Files

### Configuration Files
- `.env.example` - Template for environment variables
- `package.json` - Project dependencies and scripts

### Backend (API Routes)
- `pages/api/login.ts` - Authentication endpoint
- `pages/api/admin/change-password.ts` - Password change
- `pages/api/smtp/index.ts` - SMTP configuration management
- `pages/api/smtp/test.ts` - Test SMTP connection
- `pages/api/send.ts` - Send emails
- `pages/api/templates.ts` - Template CRUD operations
- `pages/api/health.ts` - Health check

### Frontend (Pages)
- `pages/index.tsx` - Login interface
- `pages/smtp-settings.tsx` - SMTP settings & template management
- `pages/compose.tsx` - Email composition interface

### Core Libraries
- `lib/auth.ts` - JWT generation, verification, and middleware
- `lib/store.ts` - File-based storage operations

### Data Storage
- `data/store.json` - Auto-generated on first run with admin credentials

## Setup Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Setup

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` with your values:
- `JWT_SECRET` - Strong random string
- `ADMIN_EMAIL` - Your admin email
- `ADMIN_PASSWORD` - Your admin password

## First Run

On first run, the app will:
1. Create the `data/` directory
2. Create `store.json` with your admin credentials
3. Hash your password using bcrypt
4. Initialize empty SMTP config and templates

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (10 salt rounds)
- SMTP passwords are stored in plain text (see README for database migration)
- Protected routes require `Authorization: Bearer <token>` header
