// lib/api.ts

import axios from 'axios';

const instance = axios.create({
  baseURL: '/', // Next.js内からのリクエストの場合、baseURLは不要
  withCredentials: true, // クッキーを含める
});

instance.interceptors.request.use(
  (config) => {
    // トークンはhttpOnlyクッキーに保存されているため、クライアント側で直接設定する必要はありません。
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default instance;