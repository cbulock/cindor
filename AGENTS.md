# Cindor Agent Notes

## Core workflow

- Treat this repo as a component library first. When adding or changing a component, wire the full surface area: core implementation, exports, registration, stories, tests, wrappers, manifest generation, and docs coverage as needed.
- Use the root workspace scripts from the repo root.

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
