#!/bin/zsh -f
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

staged_files=("${(@f)$(git diff --cached --name-only --diff-filter=ACMR)}")

if (( ${#staged_files[@]} == 0 )); then
  echo "security: no staged files to scan"
  exit 0
fi

blocked_files=()

for staged_path in "${staged_files[@]}"; do
  base="${staged_path:t}"

  case "$base" in
    .env|.env.*)
      case "$base" in
        .env.example|.env.sample|*.example|*.sample)
          ;;
        *)
          blocked_files+=("$staged_path")
          ;;
      esac
      ;;
  esac

  case "$staged_path" in
    *.env.azure-ai*|*.npmrc|*.pypirc|*mcp_servers.json|*mcp.json|*id_rsa|*id_ed25519|*.pem|*.p12)
      blocked_files+=("$staged_path")
      ;;
  esac
done

if (( ${#blocked_files[@]} > 0 )); then
  echo "security: refusing to commit local secret/config files:"
  printf '  %s\n' "${blocked_files[@]}"
  echo "security: commit an example file or use the local secret broker/wrapper instead"
  exit 1
fi

infisical_bin="${INFISICAL_BIN:-}"
if [[ -z "$infisical_bin" ]]; then
  for candidate in /opt/homebrew/bin/infisical /usr/local/bin/infisical; do
    if [[ -x "$candidate" ]]; then
      infisical_bin="$candidate"
      break
    fi
  done
fi

if [[ -z "$infisical_bin" ]] && command -v infisical >/dev/null 2>&1; then
  infisical_bin="$(command -v infisical)"
fi

if [[ -z "$infisical_bin" ]]; then
  echo "security: infisical CLI is required for staged secret scanning"
  echo "security: install it with brew, then retry the commit"
  exit 1
fi

/usr/bin/env PATH="$PATH" "$infisical_bin" scan git-changes --staged --verbose
