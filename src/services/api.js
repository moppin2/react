
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let queue = [];

function processQueue(error) {
  queue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  queue = [];
}

api.interceptors.response.use(
  res => res,
  err => {
    const { config, response } = err;
    
    // ✅ 로그인 요청은 재시도하지 않고 바로 에러 리턴
    if (config.url.endsWith('/login')) {
      return Promise.reject(err);
    }

    if (config.url.endsWith('/refresh')) {
      return Promise.reject(err); // refresh 요청 자체는 다시 retry하지 않음
    }

    if (response?.status === 401 && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve: () => resolve(api(config)), reject });
        });
      }
      config._retry = true;
      isRefreshing = true;

      return api.post('/refresh')
        .then(() => {
          processQueue();
          return api(config);
        })
        .catch(error => {
          processQueue(error);
          return Promise.reject(error);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    return Promise.reject(err);
  }
);


export default api;