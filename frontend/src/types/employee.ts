export interface EmploymentHistory {
  id:              number;
  employer:        string;
  client:          string;
  customer:        string;
  designation:     string;
  employment_type: string;
  location:        string;
  worksite_address:string;
  status:          string;
  date_of_joining: string | null;
  exit_date:       string | null;
  primary_skills:  string;
  secondary_skills:string;
  visa_type:       string;
  id_status:       string;
  e_verify_status: string;
  recorded_at:     string;
  recorded_by_name:string;
}

export interface Employee {
  id:                number;
  first_name:        string;
  middle_name:       string;
  last_name:         string;
  full_name:         string;
  emp_no:            string;
  gender:            string;
  dob:               string | null;
  retirement_dob:    string | null;
  contact_number:    string;
  official_email:    string;
  personal_email:    string;
  address:           string;
  status:            string;
  employment_type:   string;
  date_of_joining:   string | null;
  exit_date:         string | null;
  employer:          string;
  client:            string;
  customer:          string;
  designation:       string;
  primary_skills:    string;
  secondary_skills:  string;
  location:          string;
  worksite_address:  string;
  visa_type:         string;
  id_status:         string;
  e_verify_status:   string;
  created_by_name:   string;
  updated_by_name:   string;
  created_at:        string;
  updated_at:        string;
  employment_history:EmploymentHistory[];
}

export interface DashboardStats {
  total:              number;
  active:             number;
  exited:             number;
  bench:              number;
  bench_soon:         Partial<Employee>[];
  visa_breakdown:     { visa_type: string; count: number }[];
  emp_type_breakdown: { employment_type: string; count: number }[];
  top_employers:      { employer: string; count: number }[];
  recent_employees:   Partial<Employee>[];
}
