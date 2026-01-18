create table applicants (
  id uuid primary key default gen_random_uuid(),
  application_code text unique,
  full_name text not null,
  date_of_birth date not null,
  email text not null,
  highest_degree text not null,
  years_of_experience int not null,
  preferred_course text not null,
  cv_file_path text not null,
  comments text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);
