# Civic Issue Reporting System

A comprehensive civic issue reporting platform built with Next.js, TypeScript, and Supabase. This system enables citizens to report civic issues, track their resolution, and allows government departments to manage and resolve issues efficiently.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/anshs-projects-9bcf5a5a/v0-civic-issue-reporting-system)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/0NyvHm82Drd)

## 🌟 Features

### For Citizens
- Report civic issues with photos and location
- Track issue status in real-time
- Vote and comment on issues
- View nearby issues on an interactive map
- AI-powered photo analysis for issue categorization
- Voice reporting with AI assistant

### For Administrators
- Dashboard with analytics and statistics
- Automated issue assignment to departments
- Workflow management system
- Interactive map view of all issues
- User role and department management
- Timeline tracking for issue resolution

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **PostgreSQL Client** (optional, for manual database operations)

## 🚀 Quick Start

> **📝 Note:** This setup requires you to obtain and configure your own API keys and credentials. The application will not work without proper environment configuration.

### 1. Clone the Repository

```bash
git clone https://github.com/singhalansh/pikachu-05.git
cd pikachu-05
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

> **⚠️ IMPORTANT:** You must create your own `.env.local` file with your actual credentials. The placeholder values shown below will NOT work. You need to obtain your own API keys and configuration values from the respective services.

#### Create Your Environment File

Copy the example file and add your own credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and replace all placeholder values with your actual credentials:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API (Optional - for map features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Gemini AI API (Optional - for AI-powered photo analysis)
GEMINI_API_KEY=your_gemini_api_key

# Razorpay (Optional - for crowdfunding features)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# VAPI AI Assistant (Optional - for voice features)
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id

# Site URL (for API calls)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **🔒 Security Note:** Never commit your `.env.local` file to version control. It contains sensitive credentials and is already included in `.gitignore`.

#### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the **Project URL** (use as `NEXT_PUBLIC_SUPABASE_URL`)
5. Copy the **anon/public key** (use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 4. Database Setup

#### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the migration files in order from `supabase/migrations/` directory:
   - Start with `0001_initial_schema.sql`
   - Run each migration file sequentially
   - The most comprehensive migration is `0011_comprehensive_schema_fix.sql`

#### Option B: Using PostgreSQL Client

If you have `psql` installed:

```bash
# Set your database URL
export SUPABASE_DB_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"

# Run migrations
psql $SUPABASE_DB_URL -f supabase/migrations/0001_initial_schema.sql
psql $SUPABASE_DB_URL -f supabase/migrations/0002_departments_and_workflow.sql
# Continue with other migration files...
```

For detailed database setup instructions, see [DATABASE.md](DATABASE.md) and [MANUAL_DATABASE_SETUP.md](MANUAL_DATABASE_SETUP.md).

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🏗️ Build Instructions

### Development Build

```bash
npm run dev
```

This starts the Next.js development server with hot-reloading enabled.

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

The build process will:
1. Compile TypeScript files
2. Optimize React components
3. Generate static pages where possible
4. Create optimized bundles for production

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
pikachu-05/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── citizen/           # Citizen portal pages
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...               # Feature components
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client setup
│   └── utils.ts          # Helper utilities
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── styles/               # Global styles
├── supabase/             # Database migrations
│   └── migrations/       # SQL migration files
├── public/               # Static assets
├── middleware.ts         # Next.js middleware
├── next.config.mjs       # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── .env.local           # Environment variables (create this)
```

## 🔧 Optional Integrations

### Google Maps Integration

For interactive maps and location features:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create an API key
5. Add it to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

See [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) for detailed instructions.

### AI-Powered Photo Analysis

For automatic issue categorization from photos:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to `.env.local` as `GEMINI_API_KEY`

See [AI_URGENCY_IMPLEMENTATION.md](AI_URGENCY_IMPLEMENTATION.md) for more details.

### Payment Integration (Razorpay)

For crowdfunding features:

1. Create a [Razorpay account](https://razorpay.com/)
2. Get your API keys from the dashboard
3. Add them to `.env.local`

### Voice Assistant (VAPI)

For voice-based issue reporting:

1. Sign up at [VAPI](https://vapi.ai/)
2. Create an assistant
3. Add credentials to `.env.local`

## 🚢 Deployment

### Deploying to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your GitHub repository
5. Add all environment variables from `.env.local`
6. Click "Deploy"

Your project is live at:
**[https://vercel.com/anshs-projects-9bcf5a5a/v0-civic-issue-reporting-system](https://vercel.com/anshs-projects-9bcf5a5a/v0-civic-issue-reporting-system)**

### Deploying to Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Netlify**: Use the Next.js plugin
- **Railway**: Direct deployment from GitHub
- **AWS Amplify**: Use the Next.js preset
- **Docker**: Create a Dockerfile with Node.js base image

## 🔍 Troubleshooting

### Common Issues

#### Build Errors

**Problem**: TypeScript errors during build
**Solution**: This project enforces strict TypeScript checking. Common fixes:
- Check for type mismatches in your code
- Ensure all imports have proper type definitions
- Run `npm run lint` to identify issues
- Review the TypeScript errors in the build output for specific line numbers and error messages

#### Database Connection Issues

**Problem**: "Could not find the table 'public.issues' in the schema cache"
**Solution**: 
- Verify your Supabase credentials in `.env.local`
- Ensure all database migrations have been run
- Check the Supabase dashboard for table existence

#### Missing Environment Variables

**Problem**: Application doesn't work or features are missing
**Solution**: 
- Verify all required environment variables are set in `.env.local`
- Restart the development server after adding new variables
- Check that variable names match exactly (including `NEXT_PUBLIC_` prefix)

#### Map Not Loading

**Problem**: Maps show fallback view instead of Google Maps
**Solution**:
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly
- Enable required APIs in Google Cloud Console
- Check browser console for API errors

### Getting Help

- Review [DATABASE.md](DATABASE.md) for database-related issues
- See [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) for map integration issues
- Check the additional documentation files listed below for specific features

## 📚 Additional Documentation

- [DATABASE.md](DATABASE.md) - Database schema and migrations
- [MANUAL_DATABASE_SETUP.md](MANUAL_DATABASE_SETUP.md) - Manual database setup
- [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) - Google Maps integration
- [ROLE_DEPARTMENT_SYSTEM.md](ROLE_DEPARTMENT_SYSTEM.md) - Role and department system
- [AI_URGENCY_IMPLEMENTATION.md](AI_URGENCY_IMPLEMENTATION.md) - AI features
- [CITIZEN_DASHBOARD_COMPLETE_FUNCTIONALITY.md](CITIZEN_DASHBOARD_COMPLETE_FUNCTIONALITY.md) - Citizen features
- [COMPREHENSIVE_MIGRATION_SUMMARY.md](COMPREHENSIVE_MIGRATION_SUMMARY.md) - Database migration details

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **Maps**: Google Maps API
- **AI**: Google Gemini API
- **Payments**: Razorpay
- **Voice**: VAPI AI

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

This project is synced with [v0.app](https://v0.app). Changes made through v0.app will be automatically pushed to this repository.

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🔗 Links

- **Live Application**: [Vercel Deployment](https://vercel.com/anshs-projects-9bcf5a5a/v0-civic-issue-reporting-system)
- **v0.app Project**: [Continue building](https://v0.app/chat/projects/0NyvHm82Drd)
- **Supabase**: [Dashboard](https://supabase.com/dashboard)
