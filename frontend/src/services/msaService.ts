import api from "./apiClient";

export const msaService = {
  list:   (params?: any)                    => api.get("/msa/",       { params }),
  get:    (id: number)                      => api.get(`/msa/${id}/`),
  create: (data: FormData)                  => api.post("/msa/",      data, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: number, data: FormData)      => api.patch(`/msa/${id}/`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: number)                      => api.delete(`/msa/${id}/`),
};
