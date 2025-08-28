# Deployment Infrastructure - seda.fm

## 🚀 Overview

seda.fm uses a multi-environment deployment strategy with automated CI/CD pipelines, containerization, and zero-downtime deployments. The infrastructure is designed for scalability, reliability, and easy maintenance.

## 🌍 Environment Architecture

### **Environment Hierarchy**
```
Development → QA → Sandbox → Production
     ↓         ↓       ↓         ↓
  Local DB   Test DB  Stage DB  Prod DB
  Local SB   QA SB   Sand SB   Prod SB
```

### **Environment Configurations**

#### **Development Environment**
```yaml
# Local development
Database: PostgreSQL (Docker/Local)
Supabase: Local instance (supabase start)
Auth: Local JWT tokens
Storage: Local file system
Monitoring: Console logs
SSL: Not required
```

#### **QA Environment**
```yaml
# Continuous integration testing
Database: Managed PostgreSQL (staging)
Supabase: QA project instance
Auth: Supabase Auth (QA)
Storage: Supabase Storage (QA)
Monitoring: Basic health checks
SSL: Let's Encrypt
Domain: api-qa.seda.fm
```

#### **Sandbox Environment**
```yaml
# Pre-production testing
Database: Managed PostgreSQL (prod-like)
Supabase: Sandbox project instance
Auth: Supabase Auth (sandbox)
Storage: Supabase Storage (sandbox)
Monitoring: Full monitoring stack
SSL: Let's Encrypt
Domain: api-sandbox.seda.fm
```

#### **Production Environment**
```yaml
# Live production system
Database: High-availability PostgreSQL
Supabase: Production project
Auth: Supabase Auth (production)
Storage: Supabase Storage + CDN
Monitoring: Full observability
SSL: Certificate management
Domain: api.seda.fm
```

## 🏗️ Infrastructure Stack

### **Container Architecture**
```dockerfile
# Multi-stage production Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

USER nestjs
EXPOSE 3001
CMD ["node", "dist/main"]
```

### **Docker Compose for Local Development**
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://seda_user:seda_pass@db:5432/seda_dev
      - SUPABASE_URL=http://supabase:54321
    depends_on:
      - db
      - supabase
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=seda_dev
      - POSTGRES_USER=seda_user
      - POSTGRES_PASSWORD=seda_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  supabase:
    image: supabase/supabase:latest
    ports:
      - "54321:54321"
      - "54323:54323"
    environment:
      - SUPABASE_AUTH_ENABLE_SIGNUP=true
      - SUPABASE_AUTH_JWT_EXPIRY=3600
    volumes:
      - ./supabase:/supabase

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy seda.fm API

on:
  push:
    branches: [main, develop, qa]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: seda_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/seda_test

      - name: Run e2e tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/seda_test

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy-qa:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: qa
    
    steps:
      - name: Deploy to QA
        run: |
          echo "Deploying to QA environment"
          # Add your deployment commands here

  deploy-sandbox:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: sandbox
    
    steps:
      - name: Deploy to Sandbox
        run: |
          echo "Deploying to Sandbox environment"
          # Add your deployment commands here

  deploy-production:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: [build, deploy-sandbox]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Deploy to Production
        run: |
          echo "Deploying to Production environment"
          # Add your deployment commands here
```

### **Deployment Scripts**

#### **Environment-specific Deployment**
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-qa}
VERSION=${2:-latest}

echo "🚀 Deploying seda.fm API to $ENVIRONMENT"

# Validate environment
case $ENVIRONMENT in
  qa|sandbox|production)
    echo "✅ Deploying to $ENVIRONMENT"
    ;;
  *)
    echo "❌ Invalid environment. Use: qa, sandbox, or production"
    exit 1
    ;;
esac

# Load environment-specific configuration
source "./config/${ENVIRONMENT}.env"

# Build and tag image
echo "📦 Building Docker image..."
docker build -t seda-api:${VERSION} .
docker tag seda-api:${VERSION} $DOCKER_REGISTRY/seda-api:${VERSION}

# Push to registry
echo "📤 Pushing to registry..."
docker push $DOCKER_REGISTRY/seda-api:${VERSION}

# Database migrations
echo "🗄️ Running database migrations..."
npm run prisma:migrate:deploy

# Deploy Supabase functions
echo "⚡ Deploying Supabase functions..."
cd supabase
./deploy.sh $ENVIRONMENT
cd ..

# Deploy application
echo "🚢 Deploying application..."
case $ENVIRONMENT in
  qa)
    kubectl apply -f k8s/qa/
    kubectl set image deployment/seda-api-qa seda-api=$DOCKER_REGISTRY/seda-api:${VERSION} -n seda-qa
    ;;
  sandbox)
    kubectl apply -f k8s/sandbox/
    kubectl set image deployment/seda-api-sandbox seda-api=$DOCKER_REGISTRY/seda-api:${VERSION} -n seda-sandbox
    ;;
  production)
    # Blue-green deployment for production
    ./scripts/blue-green-deploy.sh $VERSION
    ;;
esac

# Health check
echo "🔍 Running health checks..."
./scripts/health-check.sh $ENVIRONMENT

echo "✅ Deployment completed successfully!"
```

#### **Blue-Green Deployment**
```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -e

VERSION=$1
NAMESPACE="seda-prod"
APP_NAME="seda-api"

echo "🔵 Starting blue-green deployment for version $VERSION"

# Check current deployment
CURRENT_DEPLOYMENT=$(kubectl get service $APP_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.version}')
echo "Current deployment: $CURRENT_DEPLOYMENT"

# Determine new deployment color
if [ "$CURRENT_DEPLOYMENT" = "blue" ]; then
    NEW_COLOR="green"
    OLD_COLOR="blue"
else
    NEW_COLOR="blue"
    OLD_COLOR="green"
fi

echo "Deploying to: $NEW_COLOR"

# Deploy new version
kubectl set image deployment/${APP_NAME}-${NEW_COLOR} \
    ${APP_NAME}=${DOCKER_REGISTRY}/${APP_NAME}:${VERSION} \
    -n ${NAMESPACE}

# Wait for rollout
kubectl rollout status deployment/${APP_NAME}-${NEW_COLOR} -n ${NAMESPACE}

# Run health checks
echo "🔍 Running health checks on $NEW_COLOR deployment..."
NEW_POD=$(kubectl get pods -l app=${APP_NAME},version=${NEW_COLOR} -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n ${NAMESPACE} ${NEW_POD} -- curl -f http://localhost:3001/api/v1/health

# Switch traffic
echo "🔀 Switching traffic to $NEW_COLOR"
kubectl patch service ${APP_NAME} -n ${NAMESPACE} -p '{"spec":{"selector":{"version":"'${NEW_COLOR}'"}}}'

# Verify traffic switch
sleep 30
echo "🔍 Verifying traffic switch..."
curl -f https://api.seda.fm/api/v1/health

# Scale down old deployment
echo "📉 Scaling down $OLD_COLOR deployment"
kubectl scale deployment ${APP_NAME}-${OLD_COLOR} --replicas=0 -n ${NAMESPACE}

echo "✅ Blue-green deployment completed successfully!"
```

## ⚙️ Kubernetes Configuration

### **Deployment Manifests**
```yaml
# k8s/production/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seda-api-blue
  namespace: seda-prod
  labels:
    app: seda-api
    version: blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: seda-api
      version: blue
  template:
    metadata:
      labels:
        app: seda-api
        version: blue
    spec:
      containers:
      - name: seda-api
        image: ghcr.io/seda-fm/seda-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: seda-secrets
              key: database-url
        - name: SUPABASE_SERVICE_KEY
          valueFrom:
            secretKeyRef:
              name: seda-secrets
              key: supabase-service-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seda-api-green
  namespace: seda-prod
  labels:
    app: seda-api
    version: green
spec:
  replicas: 0  # Initially scaled to 0
  selector:
    matchLabels:
      app: seda-api
      version: green
  template:
    metadata:
      labels:
        app: seda-api
        version: green
    spec:
      containers:
      - name: seda-api
        image: ghcr.io/seda-fm/seda-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: seda-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### **Service and Ingress**
```yaml
# k8s/production/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: seda-api
  namespace: seda-prod
spec:
  selector:
    app: seda-api
    version: blue  # Initially points to blue
  ports:
  - port: 80
    targetPort: 3001
    protocol: TCP
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: seda-api-ingress
  namespace: seda-prod
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.seda.fm
    secretName: seda-api-tls
  rules:
  - host: api.seda.fm
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: seda-api
            port:
              number: 80
```

## 🔐 Secrets Management

### **Kubernetes Secrets**
```yaml
# k8s/production/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: seda-secrets
  namespace: seda-prod
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  supabase-service-key: <base64-encoded-supabase-key>
  jwt-secret: <base64-encoded-jwt-secret>
  admin-api-key: <base64-encoded-admin-key>
```

### **Environment Configuration**
```bash
# config/production.env
DOCKER_REGISTRY=ghcr.io/seda-fm
KUBERNETES_NAMESPACE=seda-prod
SUPABASE_PROJECT_REF=your-prod-project-ref
DATABASE_URL=postgresql://prod-user:prod-pass@prod-db:5432/seda_prod
```

## 📊 Monitoring and Health Checks

### **Health Check Script**
```bash
#!/bin/bash
# scripts/health-check.sh

ENVIRONMENT=$1
MAX_RETRIES=10
RETRY_COUNT=0

case $ENVIRONMENT in
  qa)
    HEALTH_URL="https://api-qa.seda.fm/api/v1/health"
    ;;
  sandbox)
    HEALTH_URL="https://api-sandbox.seda.fm/api/v1/health"
    ;;
  production)
    HEALTH_URL="https://api.seda.fm/api/v1/health"
    ;;
  *)
    echo "❌ Invalid environment"
    exit 1
    ;;
esac

echo "🔍 Running health checks for $ENVIRONMENT"

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "Health check attempt $((RETRY_COUNT + 1))/$MAX_RETRIES"
  
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
  
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Health check passed"
    
    # Detailed health check
    HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")
    echo "Health response: $HEALTH_RESPONSE"
    
    # Verify database connectivity
    DB_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.checks.database')
    if [ "$DB_STATUS" = "true" ]; then
      echo "✅ Database connectivity verified"
    else
      echo "❌ Database connectivity failed"
      exit 1
    fi
    
    exit 0
  else
    echo "❌ Health check failed with status: $HTTP_STATUS"
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 10
  fi
done

echo "❌ Health checks failed after $MAX_RETRIES attempts"
exit 1
```

### **Monitoring Configuration**
```yaml
# k8s/production/monitoring.yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: seda-api-metrics
  namespace: seda-prod
spec:
  selector:
    matchLabels:
      app: seda-api
  endpoints:
  - port: metrics
    path: /api/v1/metrics
    interval: 30s
```

## 🚨 Rollback Procedures

### **Automated Rollback**
```bash
#!/bin/bash
# scripts/rollback.sh

set -e

ENVIRONMENT=$1
NAMESPACE="seda-${ENVIRONMENT}"

echo "🔄 Rolling back deployment in $ENVIRONMENT"

# Get current and previous revisions
CURRENT_REVISION=$(kubectl rollout history deployment/seda-api-${ENVIRONMENT} -n ${NAMESPACE} --revision=0 | tail -1 | awk '{print $1}')
PREVIOUS_REVISION=$((CURRENT_REVISION - 1))

echo "Rolling back from revision $CURRENT_REVISION to $PREVIOUS_REVISION"

# Perform rollback
kubectl rollout undo deployment/seda-api-${ENVIRONMENT} -n ${NAMESPACE} --to-revision=${PREVIOUS_REVISION}

# Wait for rollback to complete
kubectl rollout status deployment/seda-api-${ENVIRONMENT} -n ${NAMESPACE}

# Run health checks
./scripts/health-check.sh ${ENVIRONMENT}

echo "✅ Rollback completed successfully"
```

## 🔧 Troubleshooting

### **Common Deployment Issues**

#### **Container Won't Start**
```bash
# Check pod logs
kubectl logs -l app=seda-api -n seda-prod --tail=100

# Check pod events
kubectl describe pod <pod-name> -n seda-prod

# Check resource constraints
kubectl top pods -n seda-prod
```

#### **Health Checks Failing**
```bash
# Test health endpoint directly
kubectl exec -n seda-prod <pod-name> -- curl http://localhost:3001/api/v1/health

# Check database connectivity
kubectl exec -n seda-prod <pod-name> -- npm run prisma:studio

# Verify environment variables
kubectl exec -n seda-prod <pod-name> -- env | grep -E "(DATABASE_URL|SUPABASE)"
```

#### **Traffic Routing Issues**
```bash
# Check service endpoints
kubectl get endpoints seda-api -n seda-prod

# Verify ingress configuration
kubectl describe ingress seda-api-ingress -n seda-prod

# Test service discovery
kubectl exec -n seda-prod <pod-name> -- nslookup seda-api.seda-prod.svc.cluster.local
```

This comprehensive deployment documentation ensures reliable, scalable deployments with proper monitoring, rollback capabilities, and troubleshooting procedures for the seda.fm platform.