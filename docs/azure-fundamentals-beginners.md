# Azure Fundamentals for Complete Beginners

<div align="center">

![Azure](https://img.shields.io/badge/Beginner%20Friendly-00C853?style=for-the-badge)
![Time](https://img.shields.io/badge/Reading%20Time-15%20min-blue?style=for-the-badge)

**Everything you need to know about Azure before deploying your first application**

</div>

---

## Table of Contents

1. [What is Cloud Computing?](#-what-is-cloud-computing)
2. [What is Microsoft Azure?](#-what-is-microsoft-azure)
3. [Key Azure Concepts](#-key-azure-concepts)
4. [What are Containers?](#-what-are-containers)
5. [Creating an Azure Account](#-creating-an-azure-account)
6. [Navigating the Azure Portal](#-navigating-the-azure-portal)
7. [Azure Cloud Shell](#-azure-cloud-shell)
8. [Understanding Costs](#-understanding-costs)
9. [Next Steps](#-next-steps)

---

## What is Cloud Computing?

### The Simple Explanation

Imagine you need a computer to run your website. You have two choices:

| Traditional Way | Cloud Way |
|-----------------|-----------|
| Buy a physical server | Rent a virtual server |
| Set it up in your office | It's already set up in Microsoft's data center |
| You maintain it 24/7 | Microsoft maintains it |
| Pay upfront ($5,000+) | Pay monthly ($10-100) |
| Fixed capacity | Scale up/down as needed |

**Cloud computing** means renting computing resources (servers, storage, databases) from a provider like Microsoft, instead of owning them yourself.

### Why Use Cloud Computing?

| Benefit | Explanation |
|---------|-------------|
| **No upfront cost** | Pay only for what you use |
| **Scalability** | Handle 10 users or 10 million users |
| **Reliability** | Microsoft guarantees 99.9% uptime |
| **Security** | Enterprise-grade security included |
| **Global reach** | Deploy anywhere in the world |

> **Learn More:** [Microsoft Learn - Cloud Concepts](https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/)

---

## What is Microsoft Azure?

**Microsoft Azure** is Microsoft's cloud computing platform. Think of it as a massive collection of services you can rent:

```
┌─────────────────────────────────────────────────────────────┐
│                     MICROSOFT AZURE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Compute  │  │ Storage  │  │ Database │  │ Network  │    │
│  │          │  │          │  │          │  │          │    │
│  │ • VMs    │  │ • Blobs  │  │ • SQL    │  │ • VNet   │    │
│  │ • Apps   │  │ • Files  │  │ • Cosmos │  │ • DNS    │    │
│  │ • K8s    │  │ • Disks  │  │ • Redis  │  │ • CDN    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Security │  │    AI    │  │ DevOps   │  │  More... │    │
│  │          │  │          │  │          │  │          │    │
│  │ • IAM    │  │ • ML     │  │ • Repos  │  │ • IoT    │    │
│  │ • Keys   │  │ • Bot    │  │ • CI/CD  │  │ • Maps   │    │
│  │ • DDoS   │  │ • Vision │  │ • Test   │  │ • Media  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Services We'll Use in This Project

| Service | What It Does | Icon |
|---------|--------------|------|
| **Azure Container Apps** | Runs our application containers | 📦 |
| **Azure Container Registry** | Stores our container images | 🗄️ |
| **Azure SQL Database** | Stores our data | 🗃️ |
| **Azure Front Door** | Routes traffic & provides HTTPS | 🚪 |
| **Microsoft Entra ID** | Handles user authentication | 🔐 |
| **Log Analytics** | Collects logs for troubleshooting | 📊 |

> **Official Documentation:** [What is Azure?](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/what-is-azure)

---

## Key Azure Concepts

### 1. Subscriptions

A **subscription** is like a billing account. All resources you create are billed to a subscription.

```
┌─────────────────────────────────────────┐
│            YOUR AZURE ACCOUNT            │
├─────────────────────────────────────────┤
│                                          │
│   ┌─────────────────┐                   │
│   │  Subscription   │ ◄── Pay-As-You-Go │
│   │   (Billing)     │                   │
│   └────────┬────────┘                   │
│            │                             │
│   ┌────────┴────────┐                   │
│   │ Resource Group  │ ◄── Container     │
│   │   (Project)     │     for resources │
│   └────────┬────────┘                   │
│            │                             │
│   ┌────────┴────────┐                   │
│   │   Resources     │ ◄── Actual stuff  │
│   │ (VMs, DBs, etc) │                   │
│   └─────────────────┘                   │
│                                          │
└─────────────────────────────────────────┘
```

### 2. Resource Groups

A **resource group** is a folder that contains related resources. Think of it like a project folder on your computer.

**Best Practice:** Put all resources for one project in the same resource group.

| Good Practice | Bad Practice |
|---------------|--------------|
| `rg-dot-portal-dev` (one project) | Mixing resources from different projects |
| Easy to delete everything at once | Hard to track costs per project |
| Clear ownership | Confusion about what belongs where |

### 3. Regions

Azure has data centers around the world. A **region** is a geographic location where your resources run.

| Region | Location | Use When |
|--------|----------|----------|
| East US | Virginia, USA | Default for US users |
| East US 2 | Virginia, USA | Backup for East US |
| West Europe | Netherlands | European users |
| Southeast Asia | Singapore | Asian users |

**Tip:** Choose a region close to your users for better performance.

> **Reference:** [Azure Regions Map](https://azure.microsoft.com/en-us/explore/global-infrastructure/geographies/)

---

## What are Containers?

### The Problem Containers Solve

Have you ever said: *"It works on my computer!"* but it doesn't work somewhere else?

Containers solve this problem by packaging **everything** your application needs:

```
┌─────────────────────────────────────────────────────────────┐
│                      CONTAINER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐                                           │
│   │ Your Code   │  ◄── The application you wrote            │
│   └─────────────┘                                           │
│                                                              │
│   ┌─────────────┐                                           │
│   │ Runtime     │  ◄── Node.js, Python, .NET, etc.         │
│   └─────────────┘                                           │
│                                                              │
│   ┌─────────────┐                                           │
│   │ Libraries   │  ◄── Dependencies (npm packages, etc.)   │
│   └─────────────┘                                           │
│                                                              │
│   ┌─────────────┐                                           │
│   │ OS Layer    │  ◄── Minimal operating system            │
│   └─────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
         Runs the SAME everywhere!
```

### Container vs Virtual Machine

| Feature | Container | Virtual Machine |
|---------|-----------|-----------------|
| Startup time | Seconds | Minutes |
| Size | Megabytes | Gigabytes |
| Resource usage | Lightweight | Heavy |
| Isolation | Process level | Full OS |
| Best for | Microservices, APIs | Legacy apps, full OS needs |

### Key Container Terms

| Term | Definition | Example |
|------|------------|---------|
| **Image** | A template/snapshot of a container | `frontend:latest` |
| **Container** | A running instance of an image | Your app serving requests |
| **Registry** | Storage for images | Azure Container Registry |
| **Dockerfile** | Instructions to build an image | Recipe for your container |

> **Learn More:** [Introduction to Containers](https://learn.microsoft.com/en-us/training/modules/intro-to-containers/)

---

## Creating an Azure Account

### Step 1: Go to Azure Portal

1. Open your web browser
2. Navigate to: **https://portal.azure.com**

![Azure Portal Login](https://learn.microsoft.com/en-us/azure/azure-portal/media/azure-portal-overview/azure-portal-overview-portal-callouts.png)
*Source: [Microsoft Learn - Azure Portal Overview](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-overview)*

### Step 2: Create a Free Account (If Needed)

If you don't have an Azure account:

1. Click **"Start free"** or go to [azure.microsoft.com/free](https://azure.microsoft.com/free/)
2. Sign in with your Microsoft account (or create one)
3. Verify your identity with a phone number
4. Enter credit card information (for verification only)
5. Agree to terms and click **"Sign up"**

> **Free Account Benefits:**
> - $200 credit for 30 days
> - 12 months of popular free services
> - 55+ services always free

### Step 3: Verify Your Account

After signing up:
1. Check your email for a confirmation
2. Log in to [portal.azure.com](https://portal.azure.com)
3. You should see the Azure Portal dashboard

> **Video Tutorial:** [Create an Azure Account](https://learn.microsoft.com/en-us/training/modules/create-an-azure-account/)

---

## Navigating the Azure Portal

### The Portal Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ☰  Microsoft Azure                    🔍 Search    ⚙️ ☁️ ? 🔔 👤    │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│  📊 Home │           MAIN CONTENT AREA                             │
│          │                                                          │
│  ➕ Create│   ┌──────────────────────────────────────────────┐     │
│          │   │                                                │     │
│  📁 All  │   │     Dashboard / Resource Details               │     │
│  Resources   │     / Service Configuration                    │     │
│          │   │                                                │     │
│  🔖 Fav  │   │                                                │     │
│          │   └──────────────────────────────────────────────┘     │
│  ⏱️ Recent│                                                         │
│          │                                                          │
│  💳 Cost │                                                          │
│          │                                                          │
│  🛠️ More │                                                          │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### Key Areas to Know

| Area | Location | Purpose |
|------|----------|---------|
| **Search Bar** | Top center | Find any Azure service quickly |
| **Cloud Shell** | Top right (☁️ icon) | Command-line in browser |
| **Notifications** | Top right (🔔 icon) | See deployment status |
| **Left Menu** | Left side | Navigate to resources |
| **Create Resource** | Left menu (➕) | Create new services |

### Finding Things Quickly

**Method 1: Search Bar (Recommended)**
1. Click the search bar (or press `/`)
2. Type what you're looking for: "container apps", "sql database", etc.
3. Click the result

**Method 2: All Resources**
1. Click "All resources" in the left menu
2. See everything in your subscription
3. Use filters to narrow down

**Method 3: Resource Groups**
1. Click "Resource groups" in the left menu
2. Click your resource group
3. See all resources in that group

> **Reference:** [Azure Portal Overview](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-overview)

---

## Azure Cloud Shell

### What is Cloud Shell?

**Azure Cloud Shell** is a command-line terminal that runs in your web browser. It's like having a Linux computer inside Azure that's already set up with all the tools you need.

### Why Use Cloud Shell?

| Benefit | Description |
|---------|-------------|
| **No installation needed** | Everything is pre-installed |
| **Always available** | Access from any computer |
| **Persistent storage** | Your files are saved |
| **Pre-authenticated** | Already logged into your Azure account |
| **Free** | Included with your Azure subscription |

### Starting Cloud Shell

1. Log in to [portal.azure.com](https://portal.azure.com)
2. Click the **Cloud Shell icon** (☁️) in the top menu bar

![Cloud Shell Button](https://learn.microsoft.com/en-us/azure/cloud-shell/media/overview/portal-launch-icon.png)
*Source: [Microsoft Learn - Cloud Shell Overview](https://learn.microsoft.com/en-us/azure/cloud-shell/overview)*

3. First time only: Choose **Bash** or **PowerShell** (we recommend Bash)
4. First time only: Create a storage account (click "Create storage")
5. Wait for the shell to initialize

### Cloud Shell Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│ Cloud Shell                                               _ □ X     │
├─────────────────────────────────────────────────────────────────────┤
│ user@Azure:~$                                                       │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Bash ▼ │ 📁 │ ⬆️ │ ⬇️ │ 📋 │ ⚙️                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Basic Commands to Try

```bash
# See your Azure subscription
az account show

# List your resource groups
az group list --output table

# Get help
az --help
```

> **Learn More:** [Azure Cloud Shell Quickstart](https://learn.microsoft.com/en-us/azure/cloud-shell/quickstart)

---

## Understanding Costs

### How Azure Billing Works

Azure charges you for resources **while they're running**. Think of it like a utility bill.

```
┌─────────────────────────────────────────────────────────────┐
│                    AZURE BILLING                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Resource Running Time  ×  Resource Price  =  Your Bill     │
│                                                              │
│  Example:                                                    │
│  Container App running 720 hours × $0.05/hour = $36/month  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Cost-Saving Tips

| Tip | How It Saves Money |
|-----|-------------------|
| **Scale to Zero** | Container Apps can scale to 0 replicas when idle = $0 |
| **Use Free Tiers** | Many services have free tiers for small workloads |
| **Delete Unused Resources** | Don't pay for things you're not using |
| **Use Dev/Test Pricing** | Lower prices for non-production workloads |
| **Set Budget Alerts** | Get notified before you overspend |

### Estimated Costs for This Project

| Resource | Estimated Monthly Cost | Notes |
|----------|----------------------|-------|
| Container Apps | $0 - $50 | Scale-to-zero when idle |
| Azure SQL Database | $5 - $15 | Basic tier |
| Container Registry | $5 | Basic tier |
| Front Door | $35 | Standard tier |
| Log Analytics | $0 - $5 | Free tier available |
| **Total Estimate** | **$45 - $110** | Varies with usage |

### Viewing Your Costs

1. Search for **"Cost Management"** in the Azure Portal
2. Click **"Cost analysis"**
3. See spending by service, resource group, or time period

> **Reference:** [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)

---

## Next Steps

You're now ready to start deploying! Choose your path:

### Path A: Visual Deployment (Azure Portal)

Best for beginners who prefer clicking through a visual interface.

**[Start the Portal Deployment Guide →](./beginners-guide-portal.md)**

### Path B: Command-Line Deployment (Cloud Shell)

Best for those who want to learn Azure CLI commands.

**[Start the Cloud Shell Deployment Guide →](./cloud-shell-deployment-guide.md)**

---

## Quick Reference

### Useful Links

| Resource | Link |
|----------|------|
| Azure Portal | https://portal.azure.com |
| Azure Status | https://status.azure.com |
| Azure Pricing | https://azure.microsoft.com/pricing |
| Microsoft Learn | https://learn.microsoft.com |
| Azure CLI Reference | https://learn.microsoft.com/cli/azure |

### Common Azure CLI Commands

```bash
# Login to Azure
az login

# List subscriptions
az account list --output table

# Set active subscription
az account set --subscription "Your Subscription Name"

# List resource groups
az group list --output table

# Create a resource group
az group create --name myResourceGroup --location eastus

# List resources in a group
az resource list --resource-group myResourceGroup --output table
```

---

## Glossary

| Term | Definition |
|------|------------|
| **Azure** | Microsoft's cloud computing platform |
| **Subscription** | Billing account for Azure resources |
| **Resource Group** | Container for organizing related resources |
| **Region** | Geographic location of Azure data centers |
| **Container** | Packaged application with all dependencies |
| **Image** | Template/snapshot for creating containers |
| **Registry** | Storage for container images |
| **Cloud Shell** | Browser-based command line for Azure |
| **ARM** | Azure Resource Manager - manages resources |
| **RBAC** | Role-Based Access Control - permissions system |

---

<div align="center">

**Ready to continue?**

[Portal Deployment Guide](./beginners-guide-portal.md) | [Cloud Shell Guide](./cloud-shell-deployment-guide.md)

</div>
