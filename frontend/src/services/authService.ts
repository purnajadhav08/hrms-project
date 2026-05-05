import api from "./apiClient";

export const authService = {
  // Direct login — no OTP (Dhananjay: "no need for verification code")
  login:       (data: { email: string; password: string }) =>
    api.post("/auth/login/", data),
  adminSignup: (data: any) => api.post("/auth/admin/signup/", data),
  hrSignup:    (data: any) => api.post("/auth/hr/signup/",    data),
  me:          ()          => api.get("/auth/me/"),
};

export const hrService = {
  list:    ()                      => api.get("/admin/hrs/"),
  get:     (id: number)            => api.get(`/admin/hrs/${id}/`),
  update:  (id: number, d: any)    => api.put(`/admin/hrs/${id}/`, d),
  delete:  (id: number)            => api.delete(`/admin/hrs/${id}/`),
  approve: (id: number)            => api.post(`/admin/hrs/${id}/approve/`),
  revoke:  (id: number)            => api.post(`/admin/hrs/${id}/revoke/`),
};
