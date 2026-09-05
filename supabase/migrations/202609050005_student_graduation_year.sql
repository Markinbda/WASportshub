alter table public.students
  add constraint students_graduation_year_valid
  check (graduation_year is null or graduation_year between 2026 and 2050);