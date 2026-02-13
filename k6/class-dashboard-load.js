import http from 'k6/http';
import { check, sleep } from 'k6';

// Scenario-style load test focused on the teacher/class dashboard.
//
// This assumes your SPA is served from BASE_URL and that navigating
// to / (or /teacher) eventually loads the ClassDashboard.
//
// Usage:
//   k6 run -e BASE_URL=https://your-env.example.com k6/class-dashboard-load.js
//
// You can tune VUs/durations below to match your environment.

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export const options = {
  stages: [
    { duration: '30s', target: 500 },  // ramp up to 10 concurrent "users"
    { duration: '2m', target: 25 },   // hold 25 users
    { duration: '30s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],          // <1% errors
    http_req_duration: ['p(95)<1000'],       // 95% of requests < 1s
  },
};

export default function () {
  // Hit the main app entry (adjust path if your dashboard lives elsewhere)
  const res = http.get(BASE_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'html returned': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/html'),
  });

  // OPTIONAL: If you have a health or API endpoint for classrooms,
  // uncomment and adjust these calls:
  //
  // const health = http.get(`${BASE_URL}/api/health`);
  // check(health, {
  //   'health 200': (r) => r.status === 200,
  // });
  //
  // const classes = http.get(`${BASE_URL}/api/classes`);
  // check(classes, {
  //   'classes 200': (r) => r.status === 200,
  // });

  // Simulate a user spending some time on the dashboard
  sleep(1);
}

