import { request } from './client';

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function listJobs(filters = {}) {
  return request(`/jobs${toQuery(filters)}`);
}

/** Vagas do recrutador logado. */
export function listMyJobs(filters = {}) {
  return request(`/jobs/mine${toQuery(filters)}`);
}

export function getJob(id) {
  return request(`/jobs/${id}`);
}

export function createJob(payload) {
  return request('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateJob(id, payload) {
  return request(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteJob(id) {
  return request(`/jobs/${id}`, { method: 'DELETE' });
}

export function listJobApplications(jobId) {
  return request(`/jobs/${jobId}/applications`);
}
