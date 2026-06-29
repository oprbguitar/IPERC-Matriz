create extension if not exists pgcrypto;

create type public.company_sector as enum ('public', 'private');
create type public.activity_kind as enum ('routine', 'non_routine');
create type public.control_level as enum ('elimination', 'substitution', 'engineering', 'administrative', 'ppe');
create type public.risk_band as enum ('Trivial', 'Tolerable', 'Moderado', 'Importante', 'Intolerable');
create type public.approval_status as enum ('draft', 'in_review', 'approved', 'rejected', 'superseded');
create type public.legal_source_status as enum ('internal_verified', 'uploaded_official', 'requires_validation');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ruc varchar(11) not null unique check (ruc ~ '^[0-9]{11}$'),
  sector company_sector not null,
  business_activity text not null,
  ciiu_code varchar(12),
  workplace text not null,
  worker_count integer not null check (worker_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  process text,
  created_at timestamptz not null default now(),
  unique (company_id, name)
);

create table public.job_positions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete cascade,
  title text not null,
  worker_count integer not null default 1 check (worker_count > 0),
  created_at timestamptz not null default now(),
  unique (area_id, title)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_position_id uuid not null references public.job_positions(id) on delete cascade,
  name text not null,
  activity_kind activity_kind not null,
  frequency text,
  exposed_workers integer not null check (exposed_workers > 0),
  existing_controls text,
  created_at timestamptz not null default now()
);

create table public.hazards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  category text not null,
  name text not null,
  description text,
  keywords text[] not null default '{}',
  sector_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  hazard_id uuid not null references public.hazards(id),
  description text not null,
  possible_consequences text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.controls (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  level control_level not null,
  description text not null,
  technical_justification text not null,
  required_evidence text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.legal_norms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  short_name text not null,
  jurisdiction text not null default 'Peru',
  module text not null,
  source_url text,
  source_status legal_source_status not null default 'requires_validation',
  notes text,
  created_at timestamptz not null default now()
);

create table public.legal_articles (
  id uuid primary key default gen_random_uuid(),
  legal_norm_id uuid not null references public.legal_norms(id) on delete cascade,
  article_label text not null,
  obligation text not null,
  source_excerpt text,
  source_document_hash text,
  source_status legal_source_status not null,
  created_at timestamptz not null default now(),
  unique (legal_norm_id, article_label)
);

create table public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  area_id uuid not null references public.areas(id),
  job_position_id uuid not null references public.job_positions(id),
  task_id uuid not null references public.tasks(id),
  hazard_id uuid not null references public.hazards(id),
  risk_id uuid references public.risks(id),
  probability integer not null check (probability between 1 and 5),
  severity integer not null check (severity between 1 and 5),
  initial_score integer generated always as (probability * severity) stored,
  initial_level risk_band not null,
  residual_probability integer check (residual_probability between 1 and 5),
  residual_severity integer check (residual_severity between 1 and 5),
  residual_score integer generated always as (residual_probability * residual_severity) stored,
  residual_level risk_band,
  responsible_person text,
  deadline date,
  review_date date not null default current_date,
  version_label text not null default 'v1.0-draft',
  created_at timestamptz not null default now()
);

create table public.risk_control_links (id uuid primary key default gen_random_uuid(), risk_assessment_id uuid not null references public.risk_assessments(id) on delete cascade, control_id uuid not null references public.controls(id), control_order integer not null default 1, source_type text not null default 'rule_engine', created_at timestamptz not null default now(), unique (risk_assessment_id, control_id));
create table public.risk_legal_links (id uuid primary key default gen_random_uuid(), risk_assessment_id uuid not null references public.risk_assessments(id) on delete cascade, legal_norm_id uuid not null references public.legal_norms(id), legal_article_id uuid references public.legal_articles(id), obligation_snapshot text not null default 'requires legal validation', validation_status legal_source_status not null default 'requires_validation', created_at timestamptz not null default now());
create table public.evidence_records (id uuid primary key default gen_random_uuid(), risk_assessment_id uuid not null references public.risk_assessments(id) on delete cascade, control_id uuid references public.controls(id), evidence_type text not null, description text, file_url text, file_hash text, collected_at timestamptz, created_at timestamptz not null default now());
create table public.versions (id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade, version_label text not null, status approval_status not null default 'draft', change_summary text, created_by text, created_at timestamptz not null default now(), unique (company_id, version_label));
create table public.approvals (id uuid primary key default gen_random_uuid(), version_id uuid not null references public.versions(id) on delete cascade, approver_name text not null, approver_role text not null, status approval_status not null, comments text, approved_at timestamptz, created_at timestamptz not null default now());

create table public.iperc_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  ruc varchar(11),
  sector text not null,
  status text not null default 'draft',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index areas_company_id_idx on public.areas(company_id);
create index job_positions_company_area_idx on public.job_positions(company_id, area_id);
create index tasks_company_position_idx on public.tasks(company_id, job_position_id);
create index tasks_job_position_id_idx on public.tasks(job_position_id);
create index hazards_keywords_gin_idx on public.hazards using gin(keywords);
create index hazards_sector_tags_gin_idx on public.hazards using gin(sector_tags);
create index risks_hazard_id_idx on public.risks(hazard_id);
create index legal_articles_norm_idx on public.legal_articles(legal_norm_id);
create index risk_assessments_company_review_idx on public.risk_assessments(company_id, review_date desc);
create index risk_assessments_area_id_idx on public.risk_assessments(area_id);
create index risk_assessments_job_position_id_idx on public.risk_assessments(job_position_id);
create index risk_assessments_task_idx on public.risk_assessments(task_id);
create index risk_assessments_hazard_id_idx on public.risk_assessments(hazard_id);
create index risk_assessments_risk_id_idx on public.risk_assessments(risk_id);
create index risk_control_links_assessment_idx on public.risk_control_links(risk_assessment_id);
create index risk_control_links_control_id_idx on public.risk_control_links(control_id);
create index risk_legal_links_assessment_idx on public.risk_legal_links(risk_assessment_id);
create index risk_legal_links_legal_norm_id_idx on public.risk_legal_links(legal_norm_id);
create index risk_legal_links_legal_article_id_idx on public.risk_legal_links(legal_article_id);
create index evidence_records_assessment_idx on public.evidence_records(risk_assessment_id);
create index evidence_records_control_id_idx on public.evidence_records(control_id);
create index versions_company_status_idx on public.versions(company_id, status);
create index approvals_version_id_idx on public.approvals(version_id);
create index iperc_snapshots_created_idx on public.iperc_snapshots(created_at desc);
create index iperc_snapshots_payload_gin_idx on public.iperc_snapshots using gin(payload);

alter table public.companies enable row level security;
alter table public.areas enable row level security;
alter table public.job_positions enable row level security;
alter table public.tasks enable row level security;
alter table public.hazards enable row level security;
alter table public.risks enable row level security;
alter table public.controls enable row level security;
alter table public.legal_norms enable row level security;
alter table public.legal_articles enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.risk_control_links enable row level security;
alter table public.risk_legal_links enable row level security;
alter table public.evidence_records enable row level security;
alter table public.versions enable row level security;
alter table public.approvals enable row level security;
alter table public.iperc_snapshots enable row level security;

create policy "public_read_reference_hazards" on public.hazards for select to anon, authenticated using (true);
create policy "public_read_reference_risks" on public.risks for select to anon, authenticated using (true);
create policy "public_read_reference_controls" on public.controls for select to anon, authenticated using (true);
create policy "public_read_legal_norms" on public.legal_norms for select to anon, authenticated using (true);
create policy "public_read_legal_articles" on public.legal_articles for select to anon, authenticated using (source_status in ('internal_verified', 'uploaded_official'));
create policy "anon_insert_iperc_snapshots" on public.iperc_snapshots for insert to anon, authenticated with check (char_length(company_name) between 1 and 180 and (ruc is null or ruc ~ '^[0-9]{11}$') and sector in ('public', 'construction', 'mining', 'hydrocarbons', 'health', 'manufacturing', 'offices') and status in ('draft', 'submitted') and jsonb_typeof(payload) = 'object');

grant usage on schema public to anon, authenticated;
grant select on public.hazards, public.risks, public.controls, public.legal_norms, public.legal_articles to anon, authenticated;
grant insert on public.iperc_snapshots to anon, authenticated;
