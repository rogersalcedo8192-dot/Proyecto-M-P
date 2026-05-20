create table if not exists leads (
  id bigserial primary key,
  full_name text not null,
  corporate_email text not null,
  whatsapp text not null,
  occupation text,
  company_name text,
  website text,
  company_size text,
  challenge text,
  project_type text,
  project_description text,
  budget text,
  timeline text,
  consent boolean not null default false,
  source text not null default 'landing-mp',
  created_at timestamptz not null default now()
);

alter table leads
  add column if not exists full_name text,
  add column if not exists corporate_email text,
  add column if not exists whatsapp text,
  add column if not exists occupation text,
  add column if not exists company_name text,
  add column if not exists website text,
  add column if not exists company_size text,
  add column if not exists challenge text,
  add column if not exists project_type text,
  add column if not exists project_description text,
  add column if not exists budget text,
  add column if not exists timeline text,
  add column if not exists consent boolean not null default false,
  add column if not exists source text not null default 'landing-mp',
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_leads_created_at
on leads (created_at desc);

create index if not exists idx_leads_corporate_email
on leads (corporate_email);

create index if not exists idx_leads_email_created_at
on leads (lower(corporate_email), created_at desc);

create index if not exists idx_leads_project_type
on leads (project_type);

create index if not exists idx_leads_occupation
on leads (occupation);
