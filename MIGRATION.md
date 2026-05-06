# Migrating from v5 to v6

v6 is a breaking release. The action set has been narrowed to `setup`, `bundle_build`, `bundle_publish`, and a new `instance_deploy`; several v5 actions have been removed.

## At a glance

| v5                                      | v6                                                          |
| --------------------------------------- | ----------------------------------------------------------- |
| `actions/setup@v5`                      | `actions/setup@v6`                                          |
| `actions/bundle_build@v5`               | `actions/bundle_build@v6` — `build-directory` → `bundle-directory` |
| `actions/bundle_publish@v5`             | `actions/bundle_publish@v6` — `build-directory` → `bundle-directory` |
| `actions/app_deploy@v5`                 | `actions/instance_deploy@v6`                                |
| `actions/app_patch@v5`                  | folded into `actions/instance_deploy@v6` via `patch:`       |
| `actions/image_push@v5`                 | removed — push images with your existing Docker workflow    |
| `actions/preview_deploy@v5`             | not yet supported — coming in a future v6 release           |
| `actions/preview_decommission@v5`       | not yet supported — coming in a future v6 release           |
| `actions/definition_publish@v5`         | removed — invoke `mass` directly via `setup`                |

## Bump action refs

Replace `@v5` (or `@v5.1`) with `@v6` everywhere:

```diff
- uses: massdriver-cloud/actions/setup@v5
+ uses: massdriver-cloud/actions/setup@v6
```

If you've pinned the Massdriver CLI release via `setup`'s `tag:` input, it must be `2.0.0` or greater for v6:

```diff
  - uses: massdriver-cloud/actions/setup@v6
    with:
-     tag: 1.5.0
+     tag: 2.0.0
```

`tag: latest` (the default) requires no change.

## `bundle_build` / `bundle_publish`: `build-directory` → `bundle-directory`

The input was renamed for consistency with the underlying CLI flag.

```diff
  - uses: massdriver-cloud/actions/bundle_publish@v6
    with:
-     build-directory: ./bundle
+     bundle-directory: ./bundle
```

## `app_deploy` + `app_patch` → `instance_deploy`

In v5, patching parameters and deploying were separate steps. In v6 they're a single `instance_deploy` step that takes a `patch:` (one or more JQ expressions, one per line) applied to the last deployed configuration.

The input names also changed: `manifest:` → `component:`, `env:` → `environment:`. `project:` stays the same.

**v5:**

```yaml
- name: Set Image Tag
  uses: massdriver-cloud/actions/app_patch@v5
  with:
    project: ecomm
    env: prod
    manifest: api
    set: |
      .image.tag = "${{ github.sha }}"
- name: Deploy App
  uses: massdriver-cloud/actions/app_deploy@v5
  with:
    project: ecomm
    env: prod
    manifest: api
```

**v6:**

```yaml
- name: Deploy Instance
  uses: massdriver-cloud/actions/instance_deploy@v6
  with:
    project: ecomm
    environment: prod
    component: api
    patch: |
      .image.tag = "${{ github.sha }}"
```

If you only need to deploy without patching, drop the `patch:` block.

To replace the configuration wholesale from a file (json, yaml, tfvars, or toml), use `params:` instead (mutually exclusive with `patch:`):

```yaml
- name: Deploy Instance
  uses: massdriver-cloud/actions/instance_deploy@v6
  with:
    project: ecomm
    environment: prod
    component: api
    params: ./params/prod.yaml
```

## `image_push` — removed

There is no v6 replacement. Push images using your existing container workflow — for example, your cloud vendor's auth actions plus [`docker/build-push-action`](https://github.com/docker/build-push-action) — and reference the resulting tag in `instance_deploy`'s `patch:`.

**v5:**

```yaml
- name: Push Image
  uses: massdriver-cloud/actions/image_push@v5
  with:
    namespace: my-org
    image-name: my-app
    artifact: ${{ secrets.MASSDRIVER_ARTIFACT_ID }}
    region: us-west-2
    image-tags: |
      ${{ github.sha }}
      latest
```

**v6** (Docker Hub shown; for ECR/GAR/ACR/GHCR swap the login step for that registry's auth flow):

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
- name: Build and push image
  uses: docker/build-push-action@v6
  with:
    context: .
    push: true
    tags: |
      my-org/my-app:${{ github.sha }}
      my-org/my-app:latest
- name: Deploy Instance
  uses: massdriver-cloud/actions/instance_deploy@v6
  with:
    project: my-project
    environment: prod
    component: my-app
    patch: |
      .image.tag = "${{ github.sha }}"
```

See [`example_workflows/md_image_build_and_deploy.yaml`](example_workflows/md_image_build_and_deploy.yaml) for a complete end-to-end workflow.

## `preview_deploy` / `preview_decommission` — not yet supported

Preview environments are not supported in v6 yet but will be in a future release. If you rely on them today, stay on v5 until the v6 equivalents land.

## `definition_publish` — removed

Invoke the CLI directly after `setup`:

```yaml
- uses: massdriver-cloud/actions/setup@v6
- run: mass artifact-definition publish ./path/to/definition.json
```

## Self-hosted Massdriver

Self-hosted users must set `MASSDRIVER_URL` in the workflow's `env` block. SaaS users can omit it.

```yaml
env:
  MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
  MASSDRIVER_ORG_ID: ${{ secrets.MASSDRIVER_ORG_ID }}
  # MASSDRIVER_URL: https://api.your.massdriver.domain
```
