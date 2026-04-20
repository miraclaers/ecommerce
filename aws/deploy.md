# AWS Deployment Notes

This project includes a baseline AWS ECS deployment workflow in `.github/workflows/deploy-aws.yml`.

## Required GitHub configuration

Set repository variables:

- `AWS_REGION`
- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`

Set repository secret:

- `AWS_ROLE_TO_ASSUME` (OIDC-enabled role ARN)

## Runtime secrets and env

Use AWS SSM Parameter Store or AWS Secrets Manager for:

- `REDIS_URL`

Public runtime env values can be configured in the task definition:

- `NEXT_PUBLIC_WS_URL`
- `NODE_ENV`

## Local parity

Use `.env.example` as a template and run:

```bash
docker compose up --build
```

This starts:

- Next.js app (`web`)
- Redis (`redis`)
- WebSocket gateway (`realtime`)
