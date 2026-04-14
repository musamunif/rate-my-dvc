-- Run this in your Supabase SQL editor

create table professors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  department text not null,
  created_at timestamptz default now()
);

create table reviews (
  id uuid default gen_random_uuid() primary key,
  professor_id uuid references professors(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  difficulty int not null check (difficulty >= 1 and difficulty <= 5),
  course text not null,
  grade text,
  would_take_again boolean not null default false,
  comment text not null,
  created_at timestamptz default now()
);

create table ai_summaries (
  id uuid default gen_random_uuid() primary key,
  professor_id uuid references professors(id) on delete cascade not null unique,
  teaching_style text,
  difficulty_summary text,
  who_thrives text,
  tips text,
  overall_rating numeric(3,2),
  review_count int default 0,
  last_updated timestamptz default now()
);

-- Disable RLS for now (enable + add policies when you add auth)
alter table professors disable row level security;
alter table reviews disable row level security;
alter table ai_summaries disable row level security;
