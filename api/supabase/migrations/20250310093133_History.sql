create table public."History" (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  question text not null,
  answers jsonb null,
  constraint History_pkey primary key (created_at, question)
) TABLESPACE pg_default;

