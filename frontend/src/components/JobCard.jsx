import { Link } from 'react-router-dom';
import { formatSalary, workModelLabel } from '../utils/format';

export default function JobCard({ job }) {
  return (
    <article className="job-card">
      <div className="job-card__meta">
        <span className="job-card__company">{job.company}</span>
        <span className="job-card__model">{workModelLabel(job.work_model)}</span>
      </div>
      <h3 className="job-card__title">
        <Link to={`/vagas/${job.id}`}>{job.title}</Link>
      </h3>
      <p className="job-card__location">{job.location || 'Local a definir'}</p>
      <p className="job-card__salary">{formatSalary(job.salary_min, job.salary_max)}</p>
      <Link className="job-card__cta" to={`/vagas/${job.id}`}>
        Ver detalhes
      </Link>
    </article>
  );
}
