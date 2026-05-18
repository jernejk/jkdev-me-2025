#!/bin/zsh -f
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

report_dir=".tmp/security"
mkdir -p "$report_dir"

if [[ ! -f yarn.lock ]]; then
  echo "security: yarn.lock not found; update the dependency hook before pushing"
  exit 1
fi

trivy_bin="${TRIVY_BIN:-}"
if [[ -z "$trivy_bin" ]]; then
  for candidate in /opt/homebrew/bin/trivy /usr/local/bin/trivy; do
    if [[ -x "$candidate" ]]; then
      trivy_bin="$candidate"
      break
    fi
  done
fi

if [[ -z "$trivy_bin" ]] && command -v trivy >/dev/null 2>&1; then
  trivy_bin="$(command -v trivy)"
fi

if [[ -z "$trivy_bin" ]]; then
  echo "security: trivy is required for pre-push dependency scanning"
  exit 1
fi

osv_scanner_bin="${OSV_SCANNER_BIN:-}"
if [[ -z "$osv_scanner_bin" ]]; then
  for candidate in /opt/homebrew/bin/osv-scanner /usr/local/bin/osv-scanner; do
    if [[ -x "$candidate" ]]; then
      osv_scanner_bin="$candidate"
      break
    fi
  done
fi

if [[ -z "$osv_scanner_bin" ]] && command -v osv-scanner >/dev/null 2>&1; then
  osv_scanner_bin="$(command -v osv-scanner)"
fi

if [[ -z "$osv_scanner_bin" ]]; then
  echo "security: osv-scanner is required for pre-push dependency scanning"
  exit 1
fi

echo "security: running Trivy high/critical dependency scan"
"$trivy_bin" fs \
  --scanners vuln \
  --severity CRITICAL,HIGH \
  --ignore-unfixed \
  --exit-code 1 \
  --format json \
  --output "$report_dir/trivy-pre-push.json" \
  yarn.lock

echo "security: running OSV lockfile scan"
"$osv_scanner_bin" scan source \
  --lockfile yarn.lock \
  --format json \
  --output-file "$report_dir/osv-pre-push.json"

echo "security: dependency scans passed"
