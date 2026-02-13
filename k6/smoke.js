import http from 'k6/http';
import { check, sleep } from 'k6';

// Quick smoke test: low load, short duration.
// Run with:
//   k6 run k6/smoke.js
//
// Configure the base URL via environment variable:
//   k6 run -e BASE_URL=https://your-env.example.com k6/smoke.js

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export const options = {
  vus: 5,
  duration: '30s',
};

export default function () {
  const res = http.get(BASE_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 800ms': (r) => r.timings.duration < 800,
  });

  // Small pause to simulate a user reading / idle time
  sleep(1);
}

