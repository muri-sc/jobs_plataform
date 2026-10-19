import { request } from './client';

export function applyToJob(jobId) {
  return request('/applications', {
    method: 'POST',
    body: JSON.stringify({ job_id: Number(jobId) }),
  });
}

export function listMyApplications() {
  return request('/applications/me');
}

export function updateApplicationStatus(id, status) {
  return request(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
