create table audit_jobs (
  id uuid primary key default gen_random_uuid(),
  client_url text not null,
  competitor_urls text[],
  custom_instructions text,
  status text default 'pending' check (status in ('pending', 'crawling', 'analyzing', 'generating', 'completed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  result_json jsonb
);

create table pages (
  id uuid primary key default gen_random_uuid(),
  audit_job_id uuid references audit_jobs(id) on delete cascade,
  url text not null,
  page_type text,
  screenshot_url text,
  dom_json jsonb,
  created_at timestamptz default now()
);

create table sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references pages(id) on delete cascade,
  type text,
  bbox jsonb,
  created_at timestamptz default now()
);

create table components (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references sections(id) on delete cascade,
  type text,
  bbox jsonb,
  computed_styles jsonb,
  screenshot_id text,
  dom_snippet text
);

create table issues (
  id uuid primary key default gen_random_uuid(),
  audit_job_id uuid references audit_jobs(id) on delete cascade,
  rule_id text not null,
  page_id uuid references pages(id) on delete cascade,
  component_id uuid references components(id) on delete cascade,
  severity text,
  title text,
  description text,
  evidence jsonb,
  ai_explanation jsonb,
  created_at timestamptz default now()
);

create table competitor_pages (
  id uuid primary key default gen_random_uuid(),
  audit_job_id uuid references audit_jobs(id) on delete cascade,
  url text not null,
  page_type text,
  screenshot_url text,
  dom_json jsonb,
  created_at timestamptz default now()
);

create index idx_audit_jobs_status on audit_jobs(status);
create index idx_pages_audit_job_id on pages(audit_job_id);
create index idx_sections_page_id on sections(page_id);
create index idx_components_section_id on components(section_id);
create index idx_issues_audit_job_id on issues(audit_job_id);
create index idx_issues_page_id on issues(page_id);
create index idx_competitor_pages_audit_job_id on competitor_pages(audit_job_id);
