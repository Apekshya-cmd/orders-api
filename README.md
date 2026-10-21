# orders-api: CI/CD practice project

A tiny Node.js API plus a GitHub Actions pipeline that mirrors a production flow,
using only free services (GitHub Actions, GHCR, and a throwaway `kind` cluster).

## The flow

Pull request  ->  gitleaks, lint, unit + integration tests, helm lint, hadolint
Merge to main ->  build image (tag = commit SHA) -> Trivy scan -> push to GHCR
Then promote the SAME image:  dev (auto) -> qa (auto) -> prod (approval)
Each deploy: helm upgrade --install --atomic -> smoke test

## Setup (about 10 minutes)

1. Create a new GitHub repo (public is easiest) and push this folder to the `main` branch.
2. Settings -> Actions -> General -> Workflow permissions: allow read and write.
3. Settings -> Environments: create `dev`, `qa` and `prod`.
   On `prod`, tick "Required reviewers" and add yourself.
   (Private repos need a paid plan for required reviewers; public repos get it free.)
4. Settings -> Branches: protect `main` (require a pull request before merging).

## Things to try (this is where the interview learning is)

1. Open a pull request. Watch only the `test` job run. Nothing is built or deployed.
2. Merge it. Watch build -> deploy-dev -> deploy-qa, then the pipeline pauses for prod approval.
3. Approve prod. Open the logs of each deploy job and find the Helm and smoke test steps.
4. Break a unit test on purpose (change 0.1 to 0.9 in server.js). See the PR get blocked.
5. Commit a fake secret (for example AKIAIOSFODNN7EXAMPLE) on a branch. See gitleaks fail the PR.
6. Run the workflow manually (Actions -> ci-cd -> Run workflow) with "break_probe" ticked.
   The readiness probe points to /wrong, pods never become Ready, and --atomic fails the deploy.
7. Change the image tag input or a values file and see how only config differs per environment.

## Honest limitations

- Each deploy job creates a brand new kind cluster, so "environments" are throwaway.
  Rollback of a FIRST install means Helm removes the release. To practise a real upgrade
  rollback (`helm rollback`, `kubectl rollout undo`) run kind or minikube on your own machine
  and use the same chart.
- Action versions are tags for readability. In real projects pin actions to commit SHAs.
- If Trivy fails on a base-image issue, that is the scan working. Update the base image,
  or temporarily change severity in ci-cd.yml while you learn.

## Mapping to a real EKS setup

| This project            | Production                                           |
|-------------------------|------------------------------------------------------|
| kind cluster in the job | Real EKS cluster per environment                     |
| GHCR + GITHUB_TOKEN     | ECR + OIDC role per environment                      |
| kind load docker-image  | Nodes pull from ECR                                  |
| Approval on `prod`      | Approval on UAT and prod, branch rules, CODEOWNERS   |
