#!/bin/bash
# ============================================
# Production Database Backup
# Schedule: Daily via cron
# Retention: 7 daily, 4 weekly, 12 monthly
# ============================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups/puravankara}"
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-puravankara_rbac}"
DB_USER="${DB_USER:-puravankara_app}"
DB_PASSWORD="${DB_PASSWORD}"

DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="puravankara_${DB_NAME}_${DATE}.sql.gz"
TIMESTAMP=$(date +%s)

mkdir -p "$BACKUP_DIR/daily" "$BACKUP_DIR/weekly" "$BACKUP_DIR/monthly"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup: $DB_NAME"

# Dump + compress
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  | gzip > "$BACKUP_DIR/daily/$FILENAME"

# Verify backup
if [ ! -s "$BACKUP_DIR/daily/$FILENAME" ]; then
  echo "[ERROR] Backup file is empty!"
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete: $(du -h "$BACKUP_DIR/daily/$FILENAME" | cut -f1)"

# Weekly (Sunday)
if [ "$(date +%u)" = "7" ]; then
  cp "$BACKUP_DIR/daily/$FILENAME" "$BACKUP_DIR/weekly/"
  echo "Weekly backup copied"
fi

# Monthly (1st day)
if [ "$(date +%d)" = "01" ]; then
  cp "$BACKUP_DIR/daily/$FILENAME" "$BACKUP_DIR/monthly/"
  echo "Monthly backup copied"
fi

# Retention cleanup
echo "Cleaning old backups..."

# Keep 7 daily
find "$BACKUP_DIR/daily" -name "*.sql.gz" -mtime +7 -delete

# Keep 4 weekly
find "$BACKUP_DIR/weekly" -name "*.sql.gz" -mtime +28 -delete

# Keep 12 monthly
find "$BACKUP_DIR/monthly" -name "*.sql.gz" -mtime +365 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup job completed successfully"

# Push to remote storage (optional — uncomment and configure)
# aws s3 cp "$BACKUP_DIR/daily/$FILENAME" "s3://puravankara-backups/daily/"
