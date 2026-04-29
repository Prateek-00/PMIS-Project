import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5000/api", headers: { "Content-Type": "application/json" } });
api.interceptors.request.use(config => { const t = localStorage.getItem("token"); if(t) config.headers.Authorization = `Bearer ${t}`; return config; });
api.interceptors.response.use(res => res, err => { if(err.response?.status === 401){ localStorage.clear(); window.location.href="/"; } return Promise.reject(err); });
export default api;
