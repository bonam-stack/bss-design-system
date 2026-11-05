#!/bin/bash
# Publishes this design-system folder to the public repo bonam-stack/bss-design-system,
# which serves https://bonam-stack.github.io/bss-design-system/ on GitHub Pages.
# Run after pushing the claude-workspace repo. Only this folder (and its own history) leaves it.
# The push is a fast-forward; it stops if the public repo has commits this folder doesn't.
set -euo pipefail

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
SITE_REPO="https://github.com/bonam-stack/bss-design-system.git"
cd "$REPO_ROOT"

git subtree split --prefix=clipboard-demo/design-system -b ds-publish >/dev/null
git push "$SITE_REPO" ds-publish:main
echo "published: https://bonam-stack.github.io/bss-design-system/ (live in 1-2 minutes)"
