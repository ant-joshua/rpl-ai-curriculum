#!/usr/bin/env bash
# Auto DB backup script — called by Hermes cron every 6 hours
# Calls POST /api/admin/export-import/backup with admin auth
# Cleans up old backups keeping last 7

set -euo pipefail

# Source env from config file if present
CONFIG_FILE="${HOME}/.hermes/cron/backup.env"
if [ -f "$CONFIG_FILE" ]; then
	set -a; source "$CONFIG_FILE"; set +a
fi

BASE_URL="${BACKUP_BASE_URL:-https://lms-syllabus.ant-joshua.my.id}"
TOKEN="${BACKUP_ADMIN_TOKEN}"

if [ -z "$TOKEN" ]; then
	echo "ERROR: BACKUP_ADMIN_TOKEN not set (set in ~/.hermes/cron/backup.env)"
	exit 1
fi

echo "=== DB Backup $(date -Iseconds) ==="
echo "Base URL: ${BASE_URL}"

# 1. Create backup
echo "Creating backup..."
RESP=$(curl -s -X POST "${BASE_URL}/api/admin/export-import/backup" \
	-H "Authorization: Bearer ${TOKEN}" \
	-H "Content-Type: application/json")

echo "Response: $(echo "$RESP" | head -c 500)"

SUCCESS=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))" 2>/dev/null || echo "false")

if [ "$SUCCESS" != "True" ]; then
	echo "ERROR: Backup failed"
	exit 1
fi

echo "Backup created successfully"

# 2. List backups, keep last 7
echo "Cleaning up old backups..."
LIST_RESP=$(curl -s "${BASE_URL}/api/admin/export-import?prefix=backups/default/" \
	-H "Authorization: Bearer ${TOKEN}")

# Extract backup keys sorted by uploaded time, keep last 7
KEYS=$(echo "$LIST_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if not d.get('success'): sys.exit(1)
items = d.get('data', [])
items.sort(key=lambda x: x.get('uploaded', ''), reverse=True)
for item in items[7:]:
	print(item['key'])
" 2>/dev/null || echo "")

if [ -n "$KEYS" ]; then
	while IFS= read -r key; do
		[ -z "$key" ] && continue
		echo "Deleting old backup: $key"
		curl -s -X DELETE "${BASE_URL}/api/admin/export-import?key=${key}" \
			-H "Authorization: Bearer ${TOKEN}" > /dev/null
	done <<< "$KEYS"
fi

echo "=== Backup complete ==="
