# Example Workflows

Drop-in GitHub Actions workflows showing common ways to use the Massdriver actions. Copy the file that fits your scenario into `.github/workflows/` in your own repo and adjust the project / environment / component values, image name, and params file path as needed.

All examples assume `MASSDRIVER_API_KEY` and `MASSDRIVER_ORG_ID` are configured as repository secrets. If you're running self-hosted Massdriver, also set `MASSDRIVER_URL`.

## [`md_publish_and_deploy.yaml`](md_publish_and_deploy.yaml)

Minimal end-to-end flow: publish the bundle and deploy the instance on every push to `main`, patching the image tag to the commit SHA. Use this when the image is built and pushed elsewhere (or when the bundle has no container image).

## [`md_bundle_publish.yaml`](md_bundle_publish.yaml)

Publish-only. Pushes to `main` publish the bundle to Massdriver. The action is a no-op when `bundle-directory` is unchanged, so it's safe to run on every push.

## [`md_image_build_and_deploy.yaml`](md_image_build_and_deploy.yaml)

Full build, push, and deploy flow. Builds a container image with `docker/build-push-action`, pushes to Docker Hub, then publishes the bundle and deploys the instance with the new tag. Swap the `docker/login-action` step for ECR / GAR / ACR / GHCR if you're not using Docker Hub.

## [`md_gitops_deploy.yaml`](md_gitops_deploy.yaml)

GitOps-style deploy. The instance's parameters live in a file in the repo (e.g. `instances/prod.yaml`), and any commit to `main` that modifies that file triggers a redeploy with the new configuration. The commit message is attached to the deploy in Massdriver.
