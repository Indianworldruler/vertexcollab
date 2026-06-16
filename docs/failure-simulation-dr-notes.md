# Failure Simulation, Rollback, and Disaster Recovery Notes

## Project

Project Vertex - Enterprise SaaS Collaboration Platform

## DR Full Form

DR stands for Disaster Recovery.

## Purpose

This phase demonstrates how the VertexCollab application handles failures, scaling, rollback, and disaster recovery planning in a Kubernetes-based DevOps environment.

The main objective is to prove that the application can recover from common operational failures and that proper recovery procedures are planned for production-level deployment.

---

## 1. Baseline Application Status

Before starting failure simulation, the application was verified using Kubernetes commands.

Commands used:

```bash
kubectl get pods
kubectl get services
curl http://localhost:30081/health
curl http://localhost:30081/ready
```

Result:

The MongoDB, backend, and frontend pods were running successfully. The backend health and readiness endpoints were also working.

Conclusion:

The application was in a healthy state before failure simulation.

---

## 2. Backend Pod Failure Simulation

A backend pod was manually deleted to simulate application pod failure.

Command used:

```bash
kubectl delete pod BACKEND_POD_NAME
kubectl get pods
```

Result:

Kubernetes automatically recreated the deleted backend pod because the backend was managed by a Deployment with multiple replicas.

Conclusion:

This demonstrates Kubernetes self-healing capability. If one backend pod fails, Kubernetes automatically creates a replacement pod to maintain the desired state.

---

## 3. Traffic Spike / Scaling Simulation

To simulate increased traffic, backend and frontend deployments were scaled to multiple replicas.

Commands used:

```bash
kubectl scale deployment vertexcollab-backend --replicas=3
kubectl scale deployment vertexcollab-frontend --replicas=3
kubectl get pods
```

Result:

Additional backend and frontend pods were created successfully.

Conclusion:

This demonstrates horizontal scaling. Kubernetes can increase the number of running application pods to handle higher traffic.

After testing, the deployments were scaled back to normal.

Commands used:

```bash
kubectl scale deployment vertexcollab-backend --replicas=2
kubectl scale deployment vertexcollab-frontend --replicas=2
kubectl get pods
```

---

## 4. Failed Deployment Simulation

A wrong backend image was intentionally applied to simulate a failed release.

Command used:

```bash
kubectl set image deployment/vertexcollab-backend backend=wrong-backend-image:latest
kubectl get pods
```

Result:

The new backend pods failed because the image was invalid.

Conclusion:

This simulates a real-world failed deployment where a wrong or broken image is released.

---

## 5. Kubernetes Rollback

After the failed deployment, Kubernetes rollback was performed.

Commands used:

```bash
kubectl rollout undo deployment/vertexcollab-backend
kubectl rollout status deployment/vertexcollab-backend
kubectl get pods
curl http://localhost:30081/health
```

Result:

Kubernetes restored the previous working backend deployment. The backend pods returned to running state and the health endpoint worked again.

Conclusion:

This demonstrates deployment rollback. If a bad release is deployed, Kubernetes can restore the previous stable version.

---

## 6. MongoDB Disaster Recovery Note

MongoDB pod failure simulation was not performed live to avoid unnecessary risk to the running application.

For production disaster recovery, MongoDB should use:

* PersistentVolumeClaims for durable storage
* Scheduled database backups
* Backup storage in cloud storage such as AWS S3
* Restore procedures for database recovery
* Multi-node or managed database setup for high availability

Conclusion:

For this academic project, pod-level recovery was demonstrated using backend pods. Database disaster recovery is documented as a production improvement.

---

## 7. Infrastructure Disaster Recovery

Terraform was used to create the AWS infrastructure.

Terraform helps in disaster recovery because the infrastructure can be recreated using code.

Important Terraform-managed resources:

* EC2 instance
* Security group
* Instance type
* Storage volume
* Region configuration

Conclusion:

If infrastructure is lost, Terraform scripts can help recreate the required environment.

---

## 8. Application Recovery Plan

If the application fails, the recovery process is:

1. Check pod status:

```bash
kubectl get pods
```

2. Check services:

```bash
kubectl get services
```

3. Restart deployment if needed:

```bash
kubectl rollout restart deployment vertexcollab-backend
kubectl rollout restart deployment vertexcollab-frontend
```

4. Reapply Kubernetes manifests if needed:

```bash
kubectl apply -f k8s/
```

5. Verify application health:

```bash
curl http://localhost:30081/health
curl http://localhost:30081/ready
```

---

## 9. Recommended Production DR Improvements

For production-level disaster recovery, the following improvements are recommended:

* Use PersistentVolumes for MongoDB
* Take scheduled database backups
* Store backups in AWS S3 or another durable storage service
* Use multi-node Kubernetes cluster
* Deploy across multiple availability zones
* Use load balancers for high availability
* Use Vault for secure secret recovery
* Use Jenkins CI/CD for redeployment automation
* Use Prometheus and Grafana for monitoring failures
* Use ELK Stack for centralized log analysis
* Maintain Terraform scripts for infrastructure recreation

---

## Final Conclusion

The VertexCollab DevOps project successfully demonstrated failure simulation, self-healing, scaling, rollback, and disaster recovery planning.

Kubernetes handled pod recovery and rollback, Terraform supported infrastructure recovery, Jenkins supported automated deployment, Vault handled secret management, Prometheus/Grafana supported monitoring, and ELK Stack supported centralized logging.
