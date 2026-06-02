# Cindor Agent Notes

## Core workflow

- Treat this repo as a component library first. When adding or changing a component, wire the full surface area: core implementation, exports, registration, stories, tests, wrappers, manifest generation, and docs coverage as needed.
- Use the root workspace scripts from the repo root.
- Before starting a new branch, update your local `main` (`git fetch origin && git checkout main && git pull --ff-only`) and branch from that clean, current tip. Do not branch from a stale feature branch or an out-of-date local `main`.
- Before adding follow-up work to an existing feature branch, fetch `origin/main` and verify the branch is still based on current work. If the branch's original changes were already merged to `main` via squash or rebase, do not reuse that branch: create a fresh branch from updated `main` and cherry-pick or reapply only the new commits you still need.
- Before opening or updating a PR, explicitly refresh the remote refs and inspect ancestry with `git fetch origin main` plus `git merge-base HEAD origin/main`. If the merge-base is unexpectedly old, stop and rebase onto `origin/main` or move the work to a fresh branch before pushing. This avoids replaying already-merged commits and prevents version/package-lock conflicts from stale branch history.

## Version bump rule

- Whenever you make component updates, run `npm run version:auto-bump` before finishing the task.
- If the script updates workspace version files, review those changes, include them in your commit, and expect to push only after that commit exists.
- If the component change needs a larger-than-patch release, update the workspace version files deliberately instead of relying on the automatic patch bump.

## Validation

- For component work, prefer this verification flow:
  - `npm run generate:manifest`
  - `npm run generate:wrappers`
  - `npm run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
