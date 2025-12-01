# Kubernetes Deployment Guide

This directory contains manifests for running the Little Smoothie Order Management System on Kubernetes. Two sets of resources are included:

- `base/` – full stack deployment (Nuxt backend, MongoDB, Redis, ingress, seed job).
- `load-balancer/` – minimal Socket.IO load-balancer example retained for reference.

## Prerequisites

- Container image published to a registry accessible by your cluster (replace `your-registry/smoothie-backend:latest`).
- Kubernetes cluster with a default StorageClass for persistent volumes.
- Ingress controller (the sample uses NGINX annotations). Update or remove annotations for other controllers.
- TLS certificate named `smoothie-tls` in the `smoothie` namespace (or adjust the ingress spec).

## Build and push the image

From `backend/`:

```bash
npm ci
npm run build
docker build -t your-registry/smoothie-backend:latest .
docker push your-registry/smoothie-backend:latest
```

Set `your-registry` to your actual registry (e.g., `ghcr.io/your-user`, `gcr.io/your-project`).

## Apply the stack

1. Update configuration:
   - Edit `base/app-configmap.yaml` and set real values for `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_SOCKET_URL`, and database hostnames if you renamed services.
   - Edit `base/app-secret.yaml` and replace the session password with a 32+ character random string (or create the secret via `kubectl create secret`).
   - If you run MongoDB/Redis as managed services instead of in-cluster, delete the provided manifests and point the config values to those services.

2. Deploy:

```bash
kubectl apply -k k8s/base
```

3. Seed the database once resources are ready:

```bash
kubectl create job --from=job/smoothie-seed-database smoothie-seed-database-$(date +%s) -n smoothie
# (PowerShell) use: kubectl create job --from=job/smoothie-seed-database "smoothie-seed-$(Get-Date -UFormat %s)" -n smoothie
```

The base manifests already define the job; the above command creates a new run. You can also remove the job from the kustomization and apply it manually when needed.

4. Confirm everything is healthy:

```bash
kubectl get pods -n smoothie
kubectl get svc -n smoothie
kubectl describe ingress smoothie-backend -n smoothie
```

5. Update DNS to point `smoothie.example.com` (or your chosen host) to the ingress or load balancer address. Adjust `NUXT_PUBLIC_SITE_URL`/`NUXT_PUBLIC_SOCKET_URL` to match the final public URL (include `https://`).

## Handy commands

```bash
# Stream backend logs
kubectl logs -f deploy/smoothie-backend -n smoothie

# Port-forward locally (bypass ingress)
kubectl port-forward svc/smoothie-backend 8080:3000 -n smoothie

# Rerun the seeding job
date_suffix=$(date +%s)
kubectl create job smoothie-seed-${date_suffix} --from=job/smoothie-seed-database -n smoothie

# Delete the stack
kubectl delete namespace smoothie
```

## Notes

- The Socket.IO server runs inside the Nuxt container on port 4001. The ingress routes `/socket.io` traffic to that port.
- The Redis Deployment is provided for convenience. For production, consider a managed Redis or a HA chart with persistence and password auth.
- MongoDB is deployed as a single-replica StatefulSet with a 5Gi PVC. Adjust storage/replicas as needed.
- If you want horizontal pod autoscaling, add an HPA targeting `smoothie-backend` and ensure resource requests are set appropriately.

## Customization ideas

1. Swap in managed MongoDB/Redis services and remove the bundled workloads.
2. Replace the direct ingress with a `Service` of type `LoadBalancer` if your cloud provider supports dual-port LBs.
3. Create separate ConfigMaps for staging vs production and reference them with overlays (`kustomize`, Helm, etc.).
