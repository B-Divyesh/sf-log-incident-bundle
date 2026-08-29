#!/usr/bin/env sh
set -eu

base_url="${1:-http://127.0.0.1:4173}"
node "$(dirname "$0")/scripts/verify-url.mjs" "$base_url"
