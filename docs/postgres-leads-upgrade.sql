alter table leads
add column if not exists project_type text,
add column if not exists project_description text;

create index if not exists idx_leads_project_type
on leads (project_type);
