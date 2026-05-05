import api from "./apiClient";

export const offerService = {
  list:   (params?: any)            => api.get("/offers/",       { params }),
  get:    (id: number)              => api.get(`/offers/${id}/`),
  create: (data: any)               => api.post("/offers/",      data),
  update: (id: number, data: any)   => api.patch(`/offers/${id}/`, data),
  delete: (id: number)              => api.delete(`/offers/${id}/`),
};

export const poService = {
  list:   (params?: any)            => api.get("/po/",       { params }),
  get:    (id: number)              => api.get(`/po/${id}/`),
  create: (data: any)               => api.post("/po/",      data),
  update: (id: number, data: any)   => api.patch(`/po/${id}/`, data),
  delete: (id: number)              => api.delete(`/po/${id}/`),
};
