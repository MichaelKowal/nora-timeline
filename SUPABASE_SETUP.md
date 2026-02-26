# 🚀 Nora Timeline - Supabase Setup Instructions

## Prerequisites

- Supabase account created at [supabase.com](https://supabase.com)

## Step 1: Create Supabase Project

1. Go to your Supabase dashboard
2. Click "New Project"
3. Fill in project details:
   - **Name**: `nora-timeline` (or your preferred name)
   - **Organization**: Your organization
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be ready (~2-3 minutes)

## Step 2: Get Project Credentials

1. Go to **Settings** > **API** in your Supabase project
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Environment Variables

1. Open your `.env` file in the project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute all commands

This will create:

- ✅ Database tables (`users`, `timelines`, `milestones`)
- ✅ Storage bucket for photos (`timeline-photos`)
- ✅ Row Level Security (RLS) policies
- ✅ Automatic user profile creation
- ✅ Performance indexes

## Step 5: Enable Email Authentication

1. Go to **Authentication** > **Settings** in Supabase
2. Under **Auth Providers**, make sure **Email** is enabled
3. Configure email settings:
   - **Enable email confirmations**: Toggle ON (recommended)
   - **Enable email change confirmations**: Toggle ON (recommended)

## Step 6: Test Your Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Open the app and click "🔒 Login"

3. Try creating a new account:
   - Enter an email and password
   - Click "Create Account"
   - Check your email for confirmation (if enabled)

4. Sign in and test adding milestones

## Troubleshooting

### Common Issues:

**1. Environment variables not working**

- Make sure your `.env` file is in the project root
- Restart your dev server after updating `.env`
- Verify variable names start with `VITE_`

**2. Database connection errors**

- Double-check your Supabase URL and anon key
- Ensure the SQL schema was executed successfully
- Check Supabase project status (should be "Healthy")

**3. Authentication not working**

- Verify email authentication is enabled in Supabase
- Check browser console for error messages
- Ensure RLS policies were created correctly

**4. Permission denied errors**

- Run the entire `supabase-schema.sql` file
- Verify RLS policies are active
- Check that user authentication is working

### Useful Supabase Dashboard Sections:

- **Table Editor**: View and edit your data
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users and auth settings
- **Storage**: Manage uploaded photos
- **API Docs**: Auto-generated API documentation
- **Logs**: Debug issues

## Next Steps

Once setup is complete, your timeline will have:

🔐 **Secure Authentication**: Email/password login
💾 **Cloud Storage**: All data saved to Supabase
📸 **Photo Upload**: Images stored in Supabase Storage  
🔒 **Data Privacy**: Each user only sees their own timeline
📱 **Multi-device**: Access from any device with login
⚡ **Real-time**: Changes sync immediately

**Enjoy documenting your baby's precious moments! 👶✨**
