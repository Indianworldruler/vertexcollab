# Vault Secret Management - VertexCollab

Vault was used in this project to demonstrate secure secret management for the VertexCollab DevOps platform.

## Purpose

The purpose of Vault in this project is to avoid hardcoding sensitive application values directly inside source code or deployment files.

Vault was used to store and retrieve important application secrets such as:

* JWT_SECRET
* MONGO_URI
* NODE_ENV

## Vault Setup

Vault was installed on the AWS Ubuntu EC2 instance and started in development mode for academic demonstration.

Vault server was started using:

```bash
vault server -dev -dev-listen-address="127.0.0.1:8200" -dev-root-token-id="root"
```

Vault environment variables were configured using:

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'
```

Vault status was verified using:

```bash
vault status
```

## KV Secret Engine

A KV version 2 secret engine was enabled for the project:

```bash
vault secrets enable -path=vertexcollab kv-v2
```

## Secrets Stored in Vault

Application secrets were stored using:

```bash
vault kv put vertexcollab/app \
  JWT_SECRET="vault_managed_vertexcollab_secret" \
  MONGO_URI="mongodb://mongodb-service:27017/vertexcollab" \
  NODE_ENV="production"
```

Secrets were verified using:

```bash
vault kv get vertexcollab/app
```

A specific secret was retrieved using:

```bash
vault kv get -field=JWT_SECRET vertexcollab/app
```

## Kubernetes Secret Update

The JWT secret stored in Vault was retrieved and used to update the Kubernetes Secret:

```bash
kubectl create secret generic vertexcollab-secret \
  --from-literal=JWT_SECRET="$(vault kv get -field=JWT_SECRET vertexcollab/app)" \
  --dry-run=client -o yaml | kubectl apply -f -
```

The Kubernetes secret was verified using:

```bash
kubectl describe secret vertexcollab-secret
```

## Backend Restart

After updating the Kubernetes secret, the backend deployment was restarted:

```bash
kubectl rollout restart deployment vertexcollab-backend
kubectl rollout status deployment vertexcollab-backend
kubectl get pods
```

## Verification

The application was tested after Vault secret update using:

```bash
curl http://localhost:30081/health
curl http://localhost:30081/ready
```

## Conclusion

Vault was successfully used to store, retrieve, and apply application secrets to the Kubernetes deployment. This demonstrates secret management as part of the DevOps lifecycle for Project Vertex.
