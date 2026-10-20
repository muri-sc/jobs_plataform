-- Chat recrutador <-> dev
-- Aplicar em bancos criados antes desta versão:
--   psql $DATABASE_URL -f database/migrations/001_chat.sql

BEGIN;

-- Dono da vaga (vagas antigas ficam sem dono até serem atribuídas)
ALTER TABLE jobs ADD COLUMN recruiter_id BIGINT;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_recruiter
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);

CREATE TABLE messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    body VARCHAR(2000) NOT NULL CHECK (length(trim(body)) > 0),
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_messages_application ON messages(application_id, id);

COMMIT;

-- Para atribuir um dono às vagas antigas:
--   UPDATE jobs SET recruiter_id = <id do recrutador> WHERE recruiter_id IS NULL;
