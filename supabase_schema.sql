-- ============================================================================
-- ResearchOS Supabase Database Schema
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROJECTS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, archived, completed
    visibility VARCHAR(50) DEFAULT 'team', -- private, team, public
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. DATASETS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) DEFAULT 'Tabular', -- NLP, Vision, Tabular, Audio, Multimodal
    current_version VARCHAR(50) DEFAULT 'V1',
    rows_count BIGINT DEFAULT 0,
    columns_count INT DEFAULT 0,
    size_str VARCHAR(50) DEFAULT '0 MB',
    quality_score INT DEFAULT 100,
    tags TEXT[] DEFAULT '{}',
    column_schema JSONB DEFAULT '[]'::jsonb,
    pca_drift JSONB DEFAULT '[]'::jsonb,
    quality_breakdown JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. DATASET VERSIONS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dataset_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    label VARCHAR(255),
    rows_count BIGINT DEFAULT 0,
    columns_count INT DEFAULT 0,
    size_str VARCHAR(50) DEFAULT '0 MB',
    author VARCHAR(255),
    note TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, archived
    missing_values NUMERIC(5, 2) DEFAULT 0.0,
    duplicates NUMERIC(5, 2) DEFAULT 0.0,
    quality_score INT DEFAULT 100,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. EXPERIMENTS TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    model_family VARCHAR(100) DEFAULT 'Transformer',
    dataset_version VARCHAR(50) DEFAULT 'V1',
    status VARCHAR(50) DEFAULT 'queued', -- queued, running, completed, failed
    accuracy NUMERIC(6, 2) DEFAULT NULL,
    precision NUMERIC(6, 2) DEFAULT NULL,
    recall NUMERIC(6, 2) DEFAULT NULL,
    f1 NUMERIC(6, 2) DEFAULT NULL,
    loss NUMERIC(8, 4) DEFAULT NULL,
    execution_time VARCHAR(100) DEFAULT '0s',
    gpu VARCHAR(100) DEFAULT 'CPU',
    framework VARCHAR(100) DEFAULT 'PyTorch',
    epochs INT DEFAULT 10,
    batch_size INT DEFAULT 32,
    learning_rate NUMERIC(10, 6) DEFAULT 0.001,
    hyperparams JSONB DEFAULT '[]'::jsonb,
    metrics_history JSONB DEFAULT '[]'::jsonb,
    roc_curve JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. LINEAGE NODES TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lineage_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL, -- dataset, dataset_version, transformation, experiment, model
    label VARCHAR(255) NOT NULL,
    sublabel VARCHAR(255),
    pos_x NUMERIC(8, 2) DEFAULT 100,
    pos_y NUMERIC(8, 2) DEFAULT 100,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. LINEAGE EDGES TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lineage_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_node VARCHAR(100) NOT NULL,
    to_node VARCHAR(100) NOT NULL,
    label VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. TRACKING SESSIONS TABLE (Tracking SDK) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.tracking_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    experiment_id UUID REFERENCES public.experiments(id) ON DELETE SET NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(100) DEFAULT 'Python SDK',
    client_version VARCHAR(50) DEFAULT '1.0.0',
    status VARCHAR(50) DEFAULT 'active', -- active, closed, error
    events_count INT DEFAULT 0,
    logs JSONB DEFAULT '[]'::jsonb,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. ACTIVITIES LOG TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    icon VARCHAR(50) DEFAULT 'exp',
    text TEXT NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'general',
    color VARCHAR(50) DEFAULT '#0D9488',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY (RLS) ────────────────────────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineage_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineage_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if rerun
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
    DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
    DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
    DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

    DROP POLICY IF EXISTS "Users can view own datasets" ON public.datasets;
    DROP POLICY IF EXISTS "Users can insert own datasets" ON public.datasets;
    DROP POLICY IF EXISTS "Users can update own datasets" ON public.datasets;
    DROP POLICY IF EXISTS "Users can delete own datasets" ON public.datasets;

    DROP POLICY IF EXISTS "Users can view dataset versions" ON public.dataset_versions;
    DROP POLICY IF EXISTS "Users can insert dataset versions" ON public.dataset_versions;

    DROP POLICY IF EXISTS "Users can view own experiments" ON public.experiments;
    DROP POLICY IF EXISTS "Users can insert own experiments" ON public.experiments;
    DROP POLICY IF EXISTS "Users can update own experiments" ON public.experiments;
    DROP POLICY IF EXISTS "Users can delete own experiments" ON public.experiments;

    DROP POLICY IF EXISTS "Users can view own lineage" ON public.lineage_nodes;
    DROP POLICY IF EXISTS "Users can manage own lineage" ON public.lineage_nodes;

    DROP POLICY IF EXISTS "Users can view own lineage edges" ON public.lineage_edges;
    DROP POLICY IF EXISTS "Users can manage own lineage edges" ON public.lineage_edges;

    DROP POLICY IF EXISTS "Users can view own tracking" ON public.tracking_sessions;
    DROP POLICY IF EXISTS "Users can manage own tracking" ON public.tracking_sessions;

    DROP POLICY IF EXISTS "Users can view own activities" ON public.activities;
    DROP POLICY IF EXISTS "Users can insert own activities" ON public.activities;
END $$;

-- Policies for Projects
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Policies for Datasets
CREATE POLICY "Users can view own datasets" ON public.datasets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own datasets" ON public.datasets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own datasets" ON public.datasets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own datasets" ON public.datasets FOR DELETE USING (auth.uid() = user_id);

-- Policies for Dataset Versions
CREATE POLICY "Users can view dataset versions" ON public.dataset_versions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.datasets WHERE datasets.id = dataset_versions.dataset_id AND datasets.user_id = auth.uid())
);
CREATE POLICY "Users can insert dataset versions" ON public.dataset_versions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.datasets WHERE datasets.id = dataset_versions.dataset_id AND datasets.user_id = auth.uid())
);

-- Policies for Experiments
CREATE POLICY "Users can view own experiments" ON public.experiments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own experiments" ON public.experiments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experiments" ON public.experiments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experiments" ON public.experiments FOR DELETE USING (auth.uid() = user_id);

-- Policies for Lineage
CREATE POLICY "Users can view own lineage" ON public.lineage_nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own lineage" ON public.lineage_nodes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own lineage edges" ON public.lineage_edges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own lineage edges" ON public.lineage_edges FOR ALL USING (auth.uid() = user_id);

-- Policies for Tracking Sessions
CREATE POLICY "Users can view own tracking" ON public.tracking_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tracking" ON public.tracking_sessions FOR ALL USING (auth.uid() = user_id);

-- Policies for Activities
CREATE POLICY "Users can view own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_user ON public.datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_experiments_user ON public.experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
