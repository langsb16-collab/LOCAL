export type Language = 'ko' | 'en' | 'zh' | 'ja' | 'vi' | 'mn' | 'ru';

export type UserType = 'senior' | 'female' | 'disabled' | 'general';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'temporary';

export type JobStatus = 'active' | 'closed' | 'filled';

export type ApplicationStatus = 'pending' | 'reviewed' | 'interviewed' | 'accepted' | 'rejected';

export interface Municipality {
  id?: number;
  name_ko: string;
  name_en?: string;
  name_zh?: string;
  name_ja?: string;
  name_vi?: string;
  name_mn?: string;
  name_ru?: string;
  region: string;
  contact_email?: string;
  contact_phone?: string;
  created_at?: string;
}

export interface User {
  id?: number;
  email: string;
  name: string;
  phone?: string;
  birth_year?: number;
  gender?: 'male' | 'female' | 'other';
  user_type: UserType;
  disability_type?: string;
  municipality_id?: number;
  preferred_language: Language;
  created_at?: string;
}

export interface JobCategory {
  id?: number;
  name_ko: string;
  name_en?: string;
  name_zh?: string;
  name_ja?: string;
  name_vi?: string;
  name_mn?: string;
  name_ru?: string;
  icon?: string;
}

export interface Job {
  id?: number;
  title_ko: string;
  title_en?: string;
  title_zh?: string;
  title_ja?: string;
  title_vi?: string;
  title_mn?: string;
  title_ru?: string;
  description_ko: string;
  description_en?: string;
  description_zh?: string;
  description_ja?: string;
  description_vi?: string;
  description_mn?: string;
  description_ru?: string;
  category_id?: number;
  municipality_id: number;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: EmploymentType;
  work_hours?: string;
  target_type: UserType | 'all';
  required_skills?: string;
  benefits?: string;
  application_deadline?: string;
  status: JobStatus;
  views?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Application {
  id?: number;
  user_id: number;
  job_id: number;
  status: ApplicationStatus;
  cover_letter?: string;
  applied_at?: string;
  reviewed_at?: string;
}

export interface Bindings {
  DB: D1Database;
}

export interface Stats {
  total_jobs: number;
  total_applications: number;
  total_users: number;
  jobs_by_type: { target_type: string; count: number }[];
  applications_by_status: { status: string; count: number }[];
  jobs_by_municipality: { municipality_name: string; count: number }[];
}
