import api from "./apiClient";

export const employeeService = {
  stats:   ()                     => api.get("/employees/stats/"),
  list:    (params?: any)         => api.get("/employees/", { params }),
  get:     (id: number)           => api.get(`/employees/${id}/`),
  create:  (data: any)            => api.post("/employees/", data),
  update:  (id: number, data: any)=> api.patch(`/employees/${id}/`, data),
  delete:  (id: number)           => api.delete(`/employees/${id}/`),
  history: (id: number)           => api.get(`/employees/${id}/history/`),
};
