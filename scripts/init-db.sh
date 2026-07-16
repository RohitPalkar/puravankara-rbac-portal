#!/bin/bash
# ============================================
# Database initialization script
# Runs automatically on first container start
# ============================================

set -e

# Create additional schemas or extensions as needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  -- Application user (if not using POSTGRES_USER directly)
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'puravankara_app') THEN
      CREATE ROLE puravankara_app WITH LOGIN PASSWORD '${DB_PASSWORD}' CONNECTION LIMIT 50;
    END IF;
  END
  \$\$;

  -- Grant permissions
  GRANT ALL PRIVILEGES ON DATABASE puravankara_rbac TO puravankara_app;
  GRANT ALL ON SCHEMA public TO puravankara_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO puravankara_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO puravankara_app;

  -- Create backup user
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'puravankara_backup') THEN
      CREATE ROLE puravankara_backup WITH LOGIN PASSWORD '${DB_BACKUP_PASSWORD}' CONNECTION LIMIT 2;
    END IF;
  END
  \$\$;
  GRANT CONNECT ON DATABASE puravankara_rbac TO puravankara_backup;
  GRANT USAGE ON SCHEMA public TO puravankara_backup;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO puravankara_backup;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO puravankara_backup;
EOSQL

echo "Database initialization complete."
