// lib/axios.ts

import axios from 'axios';

const instance = axios.create({
  //baseURL: '/api', // ベースURLを '/api' に設定
  withCredentials: true, // クッキーを含める
});

instance.interceptors.request.use(
  (config) => {
    // 必要に応じてリクエストの設定を追加
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default instance;