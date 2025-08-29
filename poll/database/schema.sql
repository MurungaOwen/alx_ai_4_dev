-- PollApp Database Schema
-- This file contains the complete database schema for the polling application
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE poll_status AS ENUM ('draft', 'active', 'closed', 'archived');
CREATE TYPE vote_choice AS ENUM ('single', 'multiple');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status poll_status DEFAULT 'draft' NOT NULL,
    vote_type vote_choice DEFAULT 'single' NOT NULL,
    allow_anonymous BOOLEAN DEFAULT TRUE,
    allow_multiple_votes BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    total_votes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE
);

-- Poll options table
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    voter_ip TEXT, -- For anonymous votes
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    -- Ensure one vote per user per poll (for single choice polls)
    UNIQUE(poll_id, user_id, option_id)
);

-- Comments table (for future feature)
CREATE TABLE IF NOT EXISTS poll_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES poll_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE
);

-- User follows table (for future social features)
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Poll bookmarks table
CREATE TABLE IF NOT EXISTS poll_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    UNIQUE(user_id, poll_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_creator_id ON polls(creator_id);
CREATE INDEX IF NOT EXISTS idx_polls_category_id ON polls(category_id);
CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_featured ON polls(is_featured) WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_position ON poll_options(poll_id, position);

CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);

CREATE INDEX IF NOT EXISTS idx_poll_comments_poll_id ON poll_comments(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_comments_user_id ON poll_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_comments_parent_id ON poll_comments(parent_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON polls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_poll_comments_updated_at BEFORE UPDATE ON poll_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update poll vote counts
CREATE OR REPLACE FUNCTION update_poll_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment vote count for option
        UPDATE poll_options 
        SET vote_count = vote_count + 1 
        WHERE id = NEW.option_id;
        
        -- Increment total votes for poll
        UPDATE polls 
        SET total_votes = total_votes + 1 
        WHERE id = NEW.poll_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement vote count for option
        UPDATE poll_options 
        SET vote_count = vote_count - 1 
        WHERE id = OLD.option_id;
        
        -- Decrement total votes for poll
        UPDATE polls 
        SET total_votes = total_votes - 1 
        WHERE id = OLD.poll_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for vote count updates
CREATE TRIGGER update_vote_counts 
    AFTER INSERT OR DELETE ON votes 
    FOR EACH ROW EXECUTE FUNCTION update_poll_vote_counts();

-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES 
    ('Technology', 'Tech-related polls and discussions', '#3B82F6'),
    ('Entertainment', 'Movies, music, games and fun topics', '#10B981'),
    ('Business', 'Professional and business topics', '#F59E0B'),
    ('Sports', 'Sports, fitness and outdoor activities', '#EF4444'),
    ('Education', 'Learning and educational content', '#8B5CF6'),
    ('Lifestyle', 'Health, food, travel and daily life', '#EC4899'),
    ('Science', 'Scientific topics and research', '#06B6D4'),
    ('Politics', 'Political discussions and current events', '#84CC16'),
    ('General', 'General discussions and miscellaneous topics', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Views for analytics and reporting

-- Poll analytics view
CREATE OR REPLACE VIEW poll_analytics AS
SELECT 
    p.id,
    p.title,
    p.creator_id,
    p.category_id,
    c.name as category_name,
    p.status,
    p.created_at,
    p.total_votes,
    COUNT(DISTINCT v.user_id) as unique_voters,
    COUNT(DISTINCT pc.id) as comment_count,
    pr.full_name as creator_name
FROM polls p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN votes v ON p.id = v.poll_id
LEFT JOIN poll_comments pc ON p.id = pc.poll_id
LEFT JOIN profiles pr ON p.creator_id = pr.id
GROUP BY p.id, p.title, p.creator_id, p.category_id, c.name, p.status, p.created_at, p.total_votes, pr.full_name;

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    pr.id,
    pr.full_name,
    pr.email,
    pr.created_at,
    COUNT(DISTINCT p.id) as polls_created,
    COUNT(DISTINCT v.id) as votes_cast,
    COUNT(DISTINCT pb.id) as bookmarks_count,
    COALESCE(SUM(p.total_votes), 0) as total_votes_received
FROM profiles pr
LEFT JOIN polls p ON pr.id = p.creator_id
LEFT JOIN votes v ON pr.id = v.user_id
LEFT JOIN poll_bookmarks pb ON pr.id = pb.user_id
GROUP BY pr.id, pr.full_name, pr.email, pr.created_at;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Polls policies
CREATE POLICY "Active polls are viewable by everyone" ON polls FOR SELECT USING (status = 'active' OR creator_id = auth.uid());
CREATE POLICY "Users can create polls" ON polls FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own polls" ON polls FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own polls" ON polls FOR DELETE USING (auth.uid() = creator_id);

-- Poll options policies
CREATE POLICY "Poll options are viewable with their polls" ON poll_options FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM polls 
        WHERE polls.id = poll_options.poll_id 
        AND (polls.status = 'active' OR polls.creator_id = auth.uid())
    )
);
CREATE POLICY "Poll creators can manage options" ON poll_options FOR ALL USING (
    EXISTS (
        SELECT 1 FROM polls 
        WHERE polls.id = poll_options.poll_id 
        AND polls.creator_id = auth.uid()
    )
);

-- Votes policies
CREATE POLICY "Users can view all votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on active polls" ON votes FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM polls 
        WHERE polls.id = votes.poll_id 
        AND polls.status = 'active'
    )
    AND (auth.uid() = user_id OR user_id IS NULL) -- Allow anonymous votes
);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON poll_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON poll_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON poll_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON poll_comments FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON poll_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON poll_bookmarks FOR ALL USING (auth.uid() = user_id);

-- User follows policies
CREATE POLICY "Follows are viewable by everyone" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON user_follows FOR ALL USING (auth.uid() = follower_id);

-- Categories are public
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);