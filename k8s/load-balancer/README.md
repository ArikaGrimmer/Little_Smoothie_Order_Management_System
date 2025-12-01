Kubernetes example: Scaled Socket.IO + Redis

This folder contains a minimal Kubernetes example showing how to deploy a scaled Socket.IO server behind a LoadBalancer/Ingress and use Redis as the Socket.IO adapter (pub/sub).

Files
- `socket-deployment.yaml` - Deployment for the socket server (replicas: 2). Update `image` to point to your built image.
- `socket-service.yaml` - ClusterIP service for internal communication.
- `socket-loadbalancer.yaml` - LoadBalancer service (exposes port 4001) with `sessionAffinity: ClientIP`. Use your cloud provider's annotations as needed.
- `redis-deployment.yaml` - Simple single-replica Redis Deployment + ClusterIP Service for demo. For production use a managed Redis or a HA chart.
- `ingress-example.yaml` - Example Ingress (NGINX) showing timeout annotations required for long-lived WebSocket connections.

Quick start (cluster)
1. Build and push your socket-server image (example):

   docker build -t your-registry/socket-server:latest ../path-to-backend
   docker push your-registry/socket-server:latest

2. Edit `socket-deployment.yaml` and replace `your-registry/socket-server:latest` with your image.

3. Apply manifests:

   kubectl apply -f redis-deployment.yaml
   kubectl apply -f socket-deployment.yaml
   kubectl apply -f socket-service.yaml
   kubectl apply -f socket-loadbalancer.yaml
   # optionally apply ingress example if you have an ingress controller
   kubectl apply -f ingress-example.yaml

4. Verify pods and services:

   kubectl get pods -l app=socket-server
   kubectl get svc redis
   kubectl get svc socket-server-loadbalancer

Notes
- Redis: The socket server must be configured with `REDIS_URL` pointing to the Redis service (e.g., `redis://redis:6379`). The `socket-deployment.yaml` uses this value by default.
- Health checks: The Deployment uses `HTTP GET /` against the socket server port for readiness/liveness. The current server implementation responds on root with a basic message; you can add a dedicated `/health` path if you prefer.
- Sticky sessions: If your clients may use polling fallback transports, configure `sessionAffinity` on the LoadBalancer Service or the Ingress (or use cookie affinity supported by your Ingress controller). If you force WebSocket-only clients and your LB supports WebSocket upgrades, sticky affinity is not required because the Redis adapter will deliver messages across instances.
- Production Redis: Use a managed Redis service or a chart (Bitnami/Redis) with persistence and HA for production.

Security
- Use TLS in front of the socket gateway (Ingress or cloud LB) for production.
- Consider securing Redis access with a password or network policy.

Questions?
If you want, I can:
- Add a small `/health` endpoint to the socket server plugin for clearer probes.
- Add a `kustomization.yaml` or a Helm chart for easier installs.
- Create a demo `docker-compose.yml` that runs two socket server instances + redis + the Node LB for local testing.
