import api from "./apiClient";

export const offerService = {
  list:   (params?: any)            => api.get("/offers/",       { params }),
  get:    (id: number)              => api.get(`/offers/${id}/`),
  create: (data: any)               => api.post("/offers/",      data),
  update: (id: number, data: any)   => api.patch(`/offers/${id}/`, data),
  delete: (id: number)              => api.delete(`/offers/${id}/`),
};

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const poService = {
  list:       (params?: any)               => api.get("/po/",         { params }),
  get:        (id: number)                 => api.get(`/po/${id}/`),
  create:     (data: any)                  => api.post("/po/",        data),
  update:     (id: number, data: any)      => api.patch(`/po/${id}/`, data),
  createForm: (data: FormData)             => api.post("/po/",        data, multipart),
  updateForm: (id: number, data: FormData) => api.patch(`/po/${id}/`, data, multipart),
  delete:     (id: number)                 => api.delete(`/po/${id}/`),
};
