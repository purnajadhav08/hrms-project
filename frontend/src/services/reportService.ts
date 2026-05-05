import api from "./apiClient";

const BASE = "/employees/reports";

export const reportService = {
  // JSON data
  employeeMaster:  (params?: any) => api.get(`${BASE}/employee-master/`,  { params }),
  visaStatus:      (params?: any) => api.get(`${BASE}/visa-status/`,      { params }),
  employmentType:  (params?: any) => api.get(`${BASE}/employment-type/`,  { params }),
  bench:           (params?: any) => api.get(`${BASE}/bench/`,            { params }),
  client:          (params?: any) => api.get(`${BASE}/client/`,           { params }),

  // Excel download — opens as file download
  downloadExcel: (report: string, params?: any) => {
    const query = new URLSearchParams({ ...params, export: "excel" }).toString();
    const url   = `${api.defaults.baseURL}${BASE}/${report}/?${query}`;
    const token = localStorage.getItem("access_token");
    // Fetch as blob so auth header is included
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a   = document.createElement("a");
        a.href    = URL.createObjectURL(blob);
        a.download = `${report}_report.xlsx`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  },

  downloadCSV: (report: string, params?: any) => {
    const query = new URLSearchParams({ ...params, export: "csv" }).toString();
    const url   = `${api.defaults.baseURL}${BASE}/${report}/?${query}`;
    const token = localStorage.getItem("access_token");
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a   = document.createElement("a");
        a.href    = URL.createObjectURL(blob);
        a.download = `${report}_report.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  },
};
