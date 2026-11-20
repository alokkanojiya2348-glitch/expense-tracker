---
name: deploy
description: When deploying, we should run all tests first, build the production bundle, and push to the staging area.
---

# Deploy Skill

When deploying, follow these mandatory steps in order:

## 1. Run All Tests First
- Run the full test suite before any build or deploy action:
  ```bash
  npm test
  ```
- If any test fails, **abort the deployment immediately** and report the failure. Do not proceed to the build phase.

## 2. Build the Production Bundle
- Once all tests have passed successfully, compile the production bundle:
  ```bash
  npm run build
  ```
- Verify that the production build completes with exit code 0 and the distribution output directory (e.g. `dist/` or `build/`) is created with all required assets.

## 3. Push to the Staging Area
- Push the compiled production bundle to the designated staging area (staging branch or staging environment):
  ```bash
  # For git staging branch:
  git push origin <branch>:staging

  # Or copy/sync to the staging directory/server:
  # e.g., deploy to staging folder or staging URL
  ```
- Verify deployment health and report the final status to the user.
