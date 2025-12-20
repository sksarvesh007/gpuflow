import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:8000/api/v1", 
    headers:{
        "Content-Type": "application/json",
    },
});

// add an interceptor 
api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if(token){
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

export default api;