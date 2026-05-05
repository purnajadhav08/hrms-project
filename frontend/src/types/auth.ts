export type Role = "admin" | "hr";

export interface User {
  id:             number;
  email:          string;
  full_name:      string;
  role:           Role;
  is_approved:    boolean;
  emp_no:         string | null;
  designation:    string;
  account_status: string;
  contact_number: string;
  location:       string;
  date_joined:    string;
}

export interface Tokens {
  access:  string;
  refresh: string;
}
