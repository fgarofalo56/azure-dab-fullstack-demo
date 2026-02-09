# 📚 Documentation

<div align="center">

![Documentation](https://img.shields.io/badge/Documentation-Complete-00C853?style=for-the-badge&logo=readme&logoColor=white)
![Guides](https://img.shields.io/badge/15+-Guides-0078D4?style=for-the-badge&logo=bookstack&logoColor=white)
![Images](https://img.shields.io/badge/90%2B-Images-E91E63?style=for-the-badge&logo=image&logoColor=white)

### 📖 Comprehensive guides for the DOT Transportation Data Portal

[🚀 Quick Start](#-quick-start) • [👥 By Audience](#-by-audience) • [📂 By Topic](#-by-topic) • [📁 Structure](#-folder-structure)

---

[![Beginner Friendly](https://img.shields.io/badge/👶_Beginner-Friendly-00C853?style=flat-square)]()
[![MS Learn](https://img.shields.io/badge/📚_MS_Learn-Images-0078D4?style=flat-square)]()
[![Excalidraw](https://img.shields.io/badge/🎨_Excalidraw-Diagrams-6965DB?style=flat-square)]()

</div>

---

## 🚀 Quick Start

| 🎯 Your Goal | 📍 Start Here |
|:------------|:-------------|
| 🆕 **New to Azure?** | [☁️ Azure Fundamentals for Beginners](./azure-fundamentals-beginners.md) |
| 🖱️ **Deploy via Portal** | [🖥️ Beginner's Portal Guide](./beginners-guide-portal.md) |
| 📜 **Deploy via Scripts** | [⚙️ PowerShell Deployment Guide](./deployment-guide-scripts.md) |
| ☁️ **Deploy via Cloud Shell** | [☁️ Cloud Shell Guide](./cloud-shell-deployment-guide.md) |
| 🔧 **Having Issues?** | [🔧 Troubleshooting Guide](./troubleshooting-guide.md) |

---

## 📑 Documentation Index

### 👥 By Audience

#### 🟢 Beginners

| 📚 Guide | 📝 Description | ⏱️ Time |
|:---------|:--------------|:--------|
| [☁️ Azure Fundamentals](./azure-fundamentals-beginners.md) | Cloud computing basics, Azure concepts | 15 min |
| [🖥️ Beginner's Portal Guide](./beginners-guide-portal.md) | Step-by-step portal deployment | 60 min |

#### 🟡 Intermediate

| 📚 Guide | 📝 Description | ⏱️ Time |
|:---------|:--------------|:--------|
| [🚀 Setup Guide](./setup-guide.md) | Complete setup walkthrough | 45 min |
| [🖥️ Portal Deployment](./deployment-guide-portal.md) | Manual Azure Portal deployment | 60 min |
| [📜 Script Deployment](./deployment-guide-scripts.md) | PowerShell automation | 30 min |
| [☁️ Cloud Shell Deployment](./cloud-shell-deployment-guide.md) | Browser-based deployment | 45 min |
| [📦 ACR Setup](./acr-setup-guide.md) | Container Registry configuration | 20 min |
| [🐳 Container Apps Guide](./container-apps-portal-guide.md) | Container Apps deployment | 30 min |

#### 🔴 Advanced

| 📚 Guide | 📝 Description | ⏱️ Time |
|:---------|:--------------|:--------|
| [🔌 DAB Configuration](./dab-configuration-guide.md) | Data API Builder deep dive | 30 min |
| [⚙️ CI/CD Pipeline](./ci-cd-guide.md) | GitHub Actions automation | 30 min |
| [📈 Auto-Scaling](./auto-scaling-guide.md) | KEDA HTTP scaling | 20 min |
| [🏗️ Architecture](./architecture.md) | System design & patterns | 20 min |

#### 📋 Reference

| 📚 Guide | 📝 Description |
|:---------|:--------------|
| [✨ Best Practices](./best-practices-guide.md) | Security, performance, cost optimization |
| [🔧 Troubleshooting](./troubleshooting-guide.md) | 100+ solutions for common issues |
| [📋 API Reference](./api-reference.md) | REST and GraphQL API documentation |
| [📊 Monitoring Guide](./monitoring-guide.md) | Observability and alerting |

---

### 📂 By Topic

#### 🚀 Deployment

| 📚 Guide | 📝 Description |
|:---------|:--------------|
| [🖥️ Beginner's Portal Guide](./beginners-guide-portal.md) | Visual, click-by-click |
| [🖥️ Portal Deployment](./deployment-guide-portal.md) | Detailed portal steps |
| [📜 Script Deployment](./deployment-guide-scripts.md) | PowerShell automation |
| [☁️ Cloud Shell Deployment](./cloud-shell-deployment-guide.md) | No local tools needed |

#### ⚙️ Configuration

| 📚 Guide | 📝 Description |
|:---------|:--------------|
| [🔌 DAB Configuration](./dab-configuration-guide.md) | REST & GraphQL APIs |
| [📦 ACR Setup](./acr-setup-guide.md) | Container Registry |
| [🐳 Container Apps Guide](./container-apps-portal-guide.md) | Container deployment |

#### 🔧 Operations

| 📚 Guide | 📝 Description |
|:---------|:--------------|
| [📈 Auto-Scaling](./auto-scaling-guide.md) | Scale to zero, KEDA |
| [⚙️ CI/CD Pipeline](./ci-cd-guide.md) | Automated deployments |
| [📊 Monitoring Guide](./monitoring-guide.md) | Observability setup |
| [✨ Best Practices](./best-practices-guide.md) | Production readiness |

#### 🏗️ Architecture

| 📚 Guide | 📝 Description |
|:---------|:--------------|
| [🏗️ Architecture Overview](./architecture.md) | System design |
| [🎨 Visual Diagrams](../assets/README.md) | Excalidraw diagrams with Azure icons |

---

## 📁 Folder Structure

```
📁 docs/
├── 📄 README.md                      # 👈 This file
├── 📄 index.md                       # Documentation hub
├── 📁 images/                        # Image resources
│   └── 📄 README.md                  # Image guidelines
│
├── # 🟢 Getting Started
├── 📄 azure-fundamentals-beginners.md
├── 📄 setup-guide.md
│
├── # 🚀 Deployment Guides
├── 📄 beginners-guide-portal.md
├── 📄 deployment-guide-portal.md
├── 📄 deployment-guide-scripts.md
├── 📄 cloud-shell-deployment-guide.md
│
├── # ⚙️ Configuration
├── 📄 acr-setup-guide.md
├── 📄 container-apps-portal-guide.md
├── 📄 dab-configuration-guide.md
│
├── # 🔧 Operations
├── 📄 auto-scaling-guide.md
├── 📄 ci-cd-guide.md
├── 📄 monitoring-guide.md
│
├── # 📋 Reference
├── 📄 architecture.md
├── 📄 api-reference.md
├── 📄 best-practices-guide.md
└── 📄 troubleshooting-guide.md
```

---

## 🎨 Visual Assets

### 📊 Excalidraw Diagrams

Interactive architecture diagrams with official Azure icons are in [`../assets/`](../assets/):

| 🎨 Diagram | 📝 Description |
|:----------|:--------------|
| `architecture.excalidraw` | 🏗️ Main system architecture |
| `data-flow-architecture.excalidraw` | 🔄 Request/response flows |
| `deployment-architecture.excalidraw` | 🚀 CI/CD pipeline |
| `security-architecture.excalidraw` | 🔒 Security layers |
| `monitoring-architecture.excalidraw` | 📊 Observability |
| `auto-scaling-architecture.excalidraw` | 📈 KEDA scaling |
| `authentication-flow.excalidraw` | 🔐 OAuth 2.0 flow |

### 📸 Microsoft Learn Images

Documentation uses official Microsoft Learn screenshots for Azure Portal steps, ensuring accuracy with current Azure UI.

---

## 🤝 Contributing

When updating documentation:

| # | ✅ Action | 📝 Description |
|:-:|:---------|:--------------|
| 1 | 🏷️ **Add badges** | Use [Shields.io](https://shields.io) for new guides |
| 2 | 📸 **Include images** | From Microsoft Learn where applicable |
| 3 | ⏱️ **Add time estimates** | For task-based guides |
| 4 | 📋 **Update this README** | When adding new guides |
| 5 | 🔗 **Test all links** | Before committing |

---

## 📅 Version History

| 📅 Date | 🏷️ Version | 📝 Changes |
|:--------|:----------|:----------|
| 2026-02-09 | 1.2.0 | Enhanced all guides with emojis, badges, callout boxes |
| 2026-02-06 | 1.1.0 | Added Azure icons to Excalidraw diagrams, MS Learn images |
| 2026-02-04 | 1.0.0 | Initial documentation release |

---

<div align="center">

### 🚀 Get Started

[![Index](https://img.shields.io/badge/📚_Documentation_Index-0078D4?style=for-the-badge)](./index.md)
[![Azure Fundamentals](https://img.shields.io/badge/☁️_Azure_Fundamentals-00C853?style=for-the-badge)](./azure-fundamentals-beginners.md)
[![Quick Deploy](https://img.shields.io/badge/🚀_Quick_Deploy-512BD4?style=for-the-badge)](./cloud-shell-deployment-guide.md)

---

**Made with ❤️ for the Azure community**

</div>
