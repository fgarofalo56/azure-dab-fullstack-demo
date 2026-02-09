# CLAUDE.md - Azure DAB Full-Stack Demo

> **Purpose**: This file provides guidance to Claude Code when working with this repository.

---

## Project Reference

**Archon Project ID:** `e98fd171-04e1-442f-810a-8541aa639900`
**Project Title:** Azure Data API Builder Full-Stack Demo
**GitHub Repo:** https://github.com/fgarofalo56/azure-dab-fullstack-demo
**Repository Path:** E:\Repos\GitHub\MyDemoRepos\data-api-builder\azure-dab-fullstack-demo
**Primary Stack:** TypeScript (React), .NET (DAB), Azure Bicep

---

## Project Overview

This is a demonstration project showcasing Azure Data API Builder deployed as a containerized solution with:

- **Backend**: Data API Builder in Azure Container Apps
- **Frontend**: React + TypeScript consuming DAB REST/GraphQL APIs
- **Database**: Azure SQL Database
- **Auth**: Microsoft Entra ID (tenant-only access)
- **IaC**: Azure Bicep for all infrastructure

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, MSAL |
| Backend | Azure Data API Builder |
| Database | Azure SQL Database |
| Auth | Microsoft Entra ID |
| Hosting | Azure Container Apps |
| Registry | Azure Container Registry |
| Storage | Azure File Share |
| IaC | Azure Bicep |
| CI/CD | GitHub Actions |

## Key Files

| File | Purpose |
|------|---------|
| `infrastructure/bicep/main.bicep` | Main Azure deployment template |
| `src/dab-config/dab-config.json` | Data API Builder configuration |
| `src/frontend/src/App.tsx` | React application entry |
| `docs/setup-guide.md` | Step-by-step deployment guide |

## Development Commands

```bash
# Frontend development
cd src/frontend
npm install
npm run dev

# DAB local development
cd src/dab-config
dab start

# Deploy infrastructure
cd infrastructure/scripts
./deploy.ps1 -ResourceGroupName "rg-dab-demo"

# Build containers
./build-push-dab.ps1
./build-push-frontend.ps1
```

## Architecture Decisions

1. **ACI over AKS**: Simpler for demo purposes, lower cost
2. **Bicep over Terraform**: Native Azure tooling, better integration
3. **MSAL.js for Auth**: Official Microsoft library for Entra ID
4. **Vite over CRA**: Faster builds, better DX

## Security Notes

- Never commit `.env` files
- SQL credentials via Azure Key Vault
- Container Registry is private
- All traffic over HTTPS
- Entra ID enforces tenant membership

## Task Management

Use Archon MCP for all task tracking. Key commands:

```python
# Get current tasks
find_tasks(filter_by="project", filter_value="[PROJECT_ID]")

# Update task status
manage_task("update", task_id="...", status="doing")
```

---

**Version**: 1.0.0
**Created**: 2026-02-04
