-- Supabase Database Setup for Nora Timeline
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timelines table
CREATE TABLE IF NOT EXISTS public.timelines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    baby_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- Each user can have only one timeline
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timeline_id UUID REFERENCES public.timelines(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    milestone_date DATE NOT NULL,
    category TEXT CHECK (category IN ('milestone', 'first', 'growth', 'fun')),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for timeline photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('timeline-photos', 'timeline-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for timelines table
CREATE POLICY "Users can view own timelines" ON public.timelines
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own timelines" ON public.timelines
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timelines" ON public.timelines
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timelines" ON public.timelines
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for milestones table
CREATE POLICY "Users can view own milestones" ON public.milestones
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM public.timelines 
            WHERE id = timeline_id
        )
    );

CREATE POLICY "Users can create own milestones" ON public.milestones
    FOR INSERT WITH CHECK (
        auth.uid() = (
            SELECT user_id FROM public.timelines 
            WHERE id = timeline_id
        )
    );

CREATE POLICY "Users can update own milestones" ON public.milestones
    FOR UPDATE USING (
        auth.uid() = (
            SELECT user_id FROM public.timelines 
            WHERE id = timeline_id
        )
    );

CREATE POLICY "Users can delete own milestones" ON public.milestones
    FOR DELETE USING (
        auth.uid() = (
            SELECT user_id FROM public.timelines 
            WHERE id = timeline_id
        )
    );

-- Create storage policies for timeline photos
CREATE POLICY "Users can upload their own photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'timeline-photos' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view their own photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'timeline-photos' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'timeline-photos' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete their own photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'timeline-photos' AND
        auth.role() = 'authenticated'
    );

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timelines_updated_at 
    BEFORE UPDATE ON public.timelines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at 
    BEFORE UPDATE ON public.milestones
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timelines_user_id ON public.timelines(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_timeline_id ON public.milestones(timeline_id);
CREATE INDEX IF NOT EXISTS idx_milestones_milestone_date ON public.milestones(milestone_date);