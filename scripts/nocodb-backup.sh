#!/usr/bin/env bash
# =============================================================================
# JWS NocoDB Backup Script
# =============================================================================
# Exports all tables and attachments from NocoDB into a timestamped ZIP archive.
#
# Usage:
#   export NOCODB_URL="https://nocodb.example.com"
#   export NOCODB_TOKEN="your-xc-token"
#   export NOCODB_BASE_ID="your-base-id"
#   ./scripts/nocodb-backup.sh
#
# Environment variables:
#   NOCODB_URL       – NocoDB server URL (required)
#   NOCODB_TOKEN     – API token / xc-token (required)
#   NOCODB_BASE_ID   – NocoDB base ID (required)
#   BACKUP_DIR       – output directory (default: ./backups)
#   SKIP_ATTACHMENTS – set to "true" to skip attachment downloads
# =============================================================================
set -euo pipefail

# --- Configuration ----------------------------------------------------------
: "${NOCODB_URL:?Required: NOCODB_URL – e.g. https://nocodb.5tritti.de}"
: "${NOCODB_TOKEN:?Required: NOCODB_TOKEN – xc-token for API access}"
: "${NOCODB_BASE_ID:?Required: NOCODB_BASE_ID – e.g. pzceta1esnysj0x}"
: "${BACKUP_DIR:=./backups}"
: "${SKIP_ATTACHMENTS:=false}"

# Table IDs (from the project – see src/features/projects/repositories/)
PROJECTS_TABLE_ID="mdctuswlmsfvi8i"
CATEGORIES_TABLE_ID="m4wto2nnf9c230g"
COUNTRIES_TABLE_ID="mbh0s7sspgjlqvt"

# --- Setup ------------------------------------------------------------------
API_BASE="${NOCODB_URL%/}/api/v3/data/${NOCODB_BASE_ID}"
TIMESTAMP=$(date -u +"%Y-%m-%d_%H%M%S")
BACKUP_NAME="jws-nocodb-backup_${TIMESTAMP}"
TEMP_DIR=$(mktemp -d)

# Resolve BACKUP_DIR to an absolute path (avoids issues with subshell cd)
BACKUP_DIR="$(realpath -m "${BACKUP_DIR}" 2>/dev/null || (
  case "${BACKUP_DIR}" in
    /*) echo "${BACKUP_DIR}" ;;
    ./*) echo "$(pwd)/${BACKUP_DIR#./}" ;;
    *) echo "$(pwd)/${BACKUP_DIR}" ;;
  esac
))"

trap 'rm -rf "${TEMP_DIR}"' EXIT

mkdir -p "${TEMP_DIR}/data" \
         "${TEMP_DIR}/attachments" \
         "${BACKUP_DIR}"

echo "=============================================="
echo "  JWS NocoDB Backup"
echo "  Timestamp: ${TIMESTAMP}"
echo "  URL:      ${NOCODB_URL}"
echo "  Base ID:  ${NOCODB_BASE_ID}"
echo "=============================================="

# --- Helper: fetch all records with pagination -------------------------------
fetch_all() {
    local table_id="$1"
    local name="$2"
    local line_file="${TEMP_DIR}/data/${name}.jsonl"
    local next_url="${API_BASE}/${table_id}/records?limit=1000"

    > "$line_file"

    while [[ -n "$next_url" ]]; do
        local response
        response=$(curl -sf -H "xc-token: ${NOCODB_TOKEN}" "$next_url") || {
            echo "  ✗  Failed to fetch ${name} – aborting."
            return 1
        }

        # Write each record as a JSON line
        echo "$response" | jq -c '.records[]' >> "$line_file"

        # Follow pagination
        next_url=$(echo "$response" | jq -r '.next // empty')
    done

    # Combine all lines into a single JSON array
    jq -s '.' "$line_file" > "${TEMP_DIR}/data/${name}.json"
    rm -f "$line_file"

    local count
    count=$(jq 'length' "${TEMP_DIR}/data/${name}.json")
    echo "  ✓  ${name}: ${count} records"
}

# --- Step 1: Export tables --------------------------------------------------
echo ""
echo "[1/4] Exporting tables …"

fetch_all "$PROJECTS_TABLE_ID" "projects"
fetch_all "$CATEGORIES_TABLE_ID" "categories"
fetch_all "$COUNTRIES_TABLE_ID" "countries"

# --- Step 2: Download attachments (Gallery, TeaserImage) --------------------
echo ""
echo "[2/4] Downloading attachments …"

if [[ "$SKIP_ATTACHMENTS" == "true" ]]; then
    echo "  –  Skipped (SKIP_ATTACHMENTS=true)"
else
    ATTACHMENT_DIR="${TEMP_DIR}/attachments"
    DOWNLOAD_LOG="${TEMP_DIR}/downloads.log"
    : > "$DOWNLOAD_LOG"

    # Iterate over every project record
    while IFS= read -r record; do
        rec_id=$(echo "$record" | jq -r '.id // "unknown"')

        # Extract attachment URLs from Gallery and TeaserImage
        # Write lines as: url<tab>title<tab>mimetype<tab>project_id
        echo "$record" | jq -r --arg pid "$rec_id" '
          (.fields.Gallery // [])[],
          (.fields.TeaserImage // [])[]
          | [ (.signedUrl // .url // ""), (.title // "unnamed"), (.mimetype // ""), $pid ]
          | @tsv
        ' 2>/dev/null >> "$DOWNLOAD_LOG"
    done < <(jq -c '.[]' "${TEMP_DIR}/data/projects.json")

    # Count total attachments
    TOTAL_ATTACHMENTS=$(wc -l < "$DOWNLOAD_LOG")
    echo "  ℹ  ${TOTAL_ATTACHMENTS} attachments to download …"

    [[ "$TOTAL_ATTACHMENTS" -eq 0 ]] && echo "  –  No attachments"

    # Build a worker script that takes 4 positional args: url title mimetype pid
    WORKER="${TEMP_DIR}/download_worker.sh"
    cat > "$WORKER" << 'WORKER_EOF'
#!/usr/bin/env bash
url="$1"
title="$2"
mimetype="$3"
pid="$4"
dest="$5"
[[ -z "$url" ]] && exit 1

case "$mimetype" in
    video/*) subdir="video" ;;
    image/*) subdir="images" ;;
    *)       subdir="misc" ;;
esac

mkdir -p "${dest}/project_${pid}/${subdir}"
curl -sfL --max-time 60 "$url" -o "${dest}/project_${pid}/${subdir}/${title}" 2>/dev/null
WORKER_EOF
    chmod +x "$WORKER"

    # Write arguments as null-delimited stream (robust against spaces/special chars)
    while IFS=$'\t' read -r url title mimetype pid; do
        url="${url%%[[:space:]]*}"
        title="${title%%[[:space:]]*}"
        mimetype="${mimetype%%[[:space:]]*}"
        pid="${pid%%[[:space:]]*}"
        [[ -z "$url" ]] && continue
        printf '%s\0%s\0%s\0%s\0%s\0' "$url" "$title" "$mimetype" "$pid" "$ATTACHMENT_DIR"
    done < "$DOWNLOAD_LOG" | xargs -0 -P 6 -n 5 "$WORKER"

    # Count downloaded files
    TOTAL_DOWNLOADED=$(find "$ATTACHMENT_DIR" -type f 2>/dev/null | wc -l)
    TOTAL_FAILED=$((TOTAL_ATTACHMENTS - TOTAL_DOWNLOADED))

    if [[ "$TOTAL_FAILED" -gt 0 ]]; then
        echo "  ⚠  ${TOTAL_DOWNLOADED} files downloaded, ${TOTAL_FAILED} failed (of ${TOTAL_ATTACHMENTS} total)"
    else
        echo "  ✓  ${TOTAL_DOWNLOADED} files downloaded"
    fi
fi

# --- Step 3: Create manifest ------------------------------------------------
echo ""
echo "[3/4] Writing backup manifest …"

cat > "${TEMP_DIR}/backup_manifest.json" <<EOF
{
  "backup_name": "${BACKUP_NAME}",
  "timestamp": "$(date -u -Iseconds)",
  "tool": "JWS NocoDB Backup Script",
  "source": {
    "url": "${NOCODB_URL}",
    "base_id": "${NOCODB_BASE_ID}"
  },
  "tables": [
    { "name": "projects",   "table_id": "${PROJECTS_TABLE_ID}" },
    { "name": "categories", "table_id": "${CATEGORIES_TABLE_ID}" },
    { "name": "countries",  "table_id": "${COUNTRIES_TABLE_ID}" }
  ]
}
EOF

# --- Step 4: Package into ZIP -----------------------------------------------
echo ""
echo "[4/4] Creating ZIP archive …"

TARGET_FILE="${BACKUP_DIR}/${BACKUP_NAME}.zip"

(cd "${TEMP_DIR}" && zip -qr "${TARGET_FILE}" .)

ARCHIVE_SIZE=$(stat -c %s "${TARGET_FILE}" 2>/dev/null || stat -f %z "${TARGET_FILE}" 2>/dev/null)
ARCHIVE_SIZE_HUMAN=""
if command -v numfmt &>/dev/null; then
    ARCHIVE_SIZE_HUMAN=$(numfmt --to=iec-i --suffix=B "$ARCHIVE_SIZE" 2>/dev/null)
else
    ARCHIVE_SIZE_HUMAN="${ARCHIVE_SIZE} bytes"
fi

echo ""
echo "=============================================="
echo "  Backup complete!"
echo "  File:   ${TARGET_FILE}"
echo "  Size:   ${ARCHIVE_SIZE_HUMAN}"
echo "  Tables: projects, categories, countries"
echo "=============================================="

# Keep only the 30 most recent backups
cleanup_old() {
    local keep=30
    local count
    count=$(ls -1 "${BACKUP_DIR}"/jws-nocodb-backup_*.zip 2>/dev/null | wc -l)
    if [[ "$count" -gt "$keep" ]]; then
        ls -1t "${BACKUP_DIR}"/jws-nocodb-backup_*.zip | tail -n $((count - keep)) | while read -r old; do
            rm -f "$old"
            echo "  🗑  Removed old backup: $(basename "$old")"
        done
    fi
}

cleanup_old
