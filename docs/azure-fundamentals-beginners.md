# ☁️ Azure Fundamentals for Complete Beginners

<div align="center">

![Azure](https://img.shields.io/badge/Microsoft%20Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![Beginner Friendly](https://img.shields.io/badge/Beginner%20Friendly-00C853?style=for-the-badge&logo=checkmarx&logoColor=white)
![Reading Time](https://img.shields.io/badge/Reading%20Time-15%20min-blue?style=for-the-badge&logo=clock&logoColor=white)

### 🎓 Everything you need to know about Azure before deploying your first application

[☁️ Cloud Computing](#-what-is-cloud-computing) • [🔷 Azure Basics](#-what-is-microsoft-azure) • [📦 Containers](#-what-are-containers) • [🖥️ Portal](#-navigating-the-azure-portal)

---

[![Start Learning](https://img.shields.io/badge/▶_Start_Learning-0078D4?style=flat-square)](https://learn.microsoft.com/en-us/training/azure/)
[![Free Account](https://img.shields.io/badge/🆓_Get_Free_Account-00C853?style=flat-square)](https://azure.microsoft.com/free/)
[![Documentation](https://img.shields.io/badge/📚_Official_Docs-512BD4?style=flat-square)](https://learn.microsoft.com/en-us/azure/)

</div>

---

## 📑 Table of Contents

| # | Section | Description |
|:-:|:--------|:------------|
| 1 | [☁️ Cloud Computing](#-what-is-cloud-computing) | Understanding the cloud |
| 2 | [🔷 Microsoft Azure](#-what-is-microsoft-azure) | Azure platform overview |
| 3 | [🔑 Key Concepts](#-key-azure-concepts) | Subscriptions, resource groups, regions |
| 4 | [📦 Containers](#-what-are-containers) | Docker and containerization basics |
| 5 | [👤 Creating Account](#-creating-an-azure-account) | Sign up for Azure |
| 6 | [🖥️ Portal Navigation](#-navigating-the-azure-portal) | Using the Azure Portal |
| 7 | [☁️ Cloud Shell](#-azure-cloud-shell) | Browser-based CLI |
| 8 | [💰 Understanding Costs](#-understanding-costs) | Billing and cost management |
| 9 | [🚀 Next Steps](#-next-steps) | Continue your journey |

---

## ☁️ What is Cloud Computing?

### 📖 The Simple Explanation

Imagine you need a computer to run your website. You have two choices:

| 🏢 Traditional Way | ☁️ Cloud Way |
|:------------------|:------------|
| 💵 Buy a physical server | 🔄 Rent a virtual server |
| 🏠 Set it up in your office | 🌐 Already set up in Microsoft's data center |
| 🔧 You maintain it 24/7 | ✅ Microsoft maintains it |
| 💰 Pay upfront ($5,000+) | 📊 Pay monthly ($10-100) |
| 📦 Fixed capacity | 📈 Scale up/down as needed |

> 💡 **Simple Definition:** Cloud computing means renting computing resources (servers, storage, databases) from a provider like Microsoft, instead of owning them yourself.

### 🎯 Why Use Cloud Computing?

| ✨ Benefit | 📝 Explanation |
|:----------|:--------------|
| 💵 **No upfront cost** | Pay only for what you use |
| 📈 **Scalability** | Handle 10 users or 10 million users |
| 🛡️ **Reliability** | Microsoft guarantees 99.9% uptime |
| 🔒 **Security** | Enterprise-grade security included |
| 🌍 **Global reach** | Deploy anywhere in the world |

<details>
<summary>📚 <b>Learn More About Cloud Computing</b></summary>

### 🎓 Recommended Resources

| 📘 Resource | ⏱️ Time | 🔗 Link |
|:-----------|:--------|:--------|
| Cloud Concepts | 30 min | [Microsoft Learn](https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/) |
| Cloud Benefits | 20 min | [Azure Fundamentals](https://learn.microsoft.com/en-us/training/paths/azure-fundamentals-describe-cloud-concepts/) |
| Cloud Service Types | 25 min | [IaaS, PaaS, SaaS](https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/) |

</details>

---

## 🔷 What is Microsoft Azure?

**Microsoft Azure** is Microsoft's cloud computing platform. Think of it as a massive collection of services you can rent:

```
┌─────────────────────────────────────────────────────────────┐
│                     MICROSOFT AZURE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 🖥️ Compute│  │ 💾 Storage│  │ 🗃️ Database│ │ 🌐 Network│    │
│  │          │  │          │  │          │  │          │    │
│  │ • VMs    │  │ • Blobs  │  │ • SQL    │  │ • VNet   │    │
│  │ • Apps   │  │ • Files  │  │ • Cosmos │  │ • DNS    │    │
│  │ • K8s    │  │ • Disks  │  │ • Redis  │  │ • CDN    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 🔒 Security│ │ 🤖 AI     │  │ ⚙️ DevOps │  │ ➕ More...│    │
│  │          │  │          │  │          │  │          │    │
│  │ • IAM    │  │ • ML     │  │ • Repos  │  │ • IoT    │    │
│  │ • Keys   │  │ • Bot    │  │ • CI/CD  │  │ • Maps   │    │
│  │ • DDoS   │  │ • Vision │  │ • Test   │  │ • Media  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 🛠️ Services We'll Use in This Project

| 🔧 Service | 📝 What It Does | 🏷️ Icon |
|:----------|:---------------|:--------|
| **Azure Container Apps** | Runs our application containers | 📦 |
| **Azure Container Registry** | Stores our container images | 🗄️ |
| **Azure SQL Database** | Stores our data | 🗃️ |
| **Azure Front Door** | Routes traffic & provides HTTPS | 🚪 |
| **Microsoft Entra ID** | Handles user authentication | 🔐 |
| **Log Analytics** | Collects logs for troubleshooting | 📊 |

> 📚 **Official Documentation:** [What is Azure?](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/get-started/what-is-azure)

---

## 🔑 Key Azure Concepts

### 1️⃣ Subscriptions

A **subscription** is like a billing account. All resources you create are billed to a subscription.

```
┌─────────────────────────────────────────┐
│         🏠 YOUR AZURE ACCOUNT           │
├─────────────────────────────────────────┤
│                                          │
│   ┌─────────────────┐                   │
│   │  💳 Subscription │ ◄── Pay-As-You-Go│
│   │    (Billing)     │                   │
│   └────────┬────────┘                   │
│            │                             │
│   ┌────────┴────────┐                   │
│   │ 📁 Resource Group│ ◄── Container    │
│   │    (Project)     │     for resources │
│   └────────┬────────┘                   │
│            │                             │
│   ┌────────┴────────┐                   │
│   │  🔧 Resources    │ ◄── Actual stuff │
│   │ (VMs, DBs, etc)  │                   │
│   └─────────────────┘                   │
│                                          │
└─────────────────────────────────────────┘
```

### 2️⃣ Resource Groups

A **resource group** is a folder that contains related resources. Think of it like a project folder on your computer.

> 💡 **Best Practice:** Put all resources for one project in the same resource group.

| ✅ Good Practice | ❌ Bad Practice |
|:----------------|:---------------|
| `rg-dot-portal-dev` (one project) | Mixing resources from different projects |
| Easy to delete everything at once | Hard to track costs per project |
| Clear ownership | Confusion about what belongs where |

### 3️⃣ Regions

Azure has data centers around the world. A **region** is a geographic location where your resources run.

| 🌍 Region | 📍 Location | 🎯 Use When |
|:---------|:-----------|:-----------|
| East US | Virginia, USA | Default for US users |
| East US 2 | Virginia, USA | Backup for East US |
| West Europe | Netherlands | European users |
| Southeast Asia | Singapore | Asian users |

> 💡 **Tip:** Choose a region close to your users for better performance.

📚 **Reference:** [Azure Regions Map](https://azure.microsoft.com/en-us/explore/global-infrastructure/geographies/)

---

## 📦 What are Containers?

### 🤔 The Problem Containers Solve

Have you ever said: *"It works on my computer!"* but it doesn't work somewhere else?

Containers solve this problem by packaging **everything** your application needs:

```
┌─────────────────────────────────────────────────────────────┐
│                     📦 CONTAINER                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐                                           │
│   │ 💻 Your Code │  ◄── The application you wrote           │
│   └─────────────┘                                           │
│                                                              │
│   ┌─────────────┐                                           │
│   │ ⚙️ Runtime   │  ◄── Node.js, Python, .NET, etc.         │
│   └─────────────┘                                           │
│                                                              │
│   ┌─────────────┐                                           │
│   │ 📚 Libraries │  ◄── Dependencies (npm packages, etc.)   │
│   └─────────────┘                                           │
│                                                              │
│   ┌─────────────┐                                           │
│   │ 🐧 OS Layer  │  ◄── Minimal operating system            │
│   └─────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
         ✅ Runs the SAME everywhere!
```

### 📊 Container vs Virtual Machine

| 🏷️ Feature | 📦 Container | 🖥️ Virtual Machine |
|:----------|:------------|:------------------|
| ⏱️ Startup time | Seconds | Minutes |
| 📏 Size | Megabytes | Gigabytes |
| 💾 Resource usage | Lightweight | Heavy |
| 🔒 Isolation | Process level | Full OS |
| 🎯 Best for | Microservices, APIs | Legacy apps, full OS needs |

### 📖 Key Container Terms

| 🏷️ Term | 📝 Definition | 💡 Example |
|:--------|:-------------|:----------|
| **Image** | A template/snapshot of a container | `frontend:latest` |
| **Container** | A running instance of an image | Your app serving requests |
| **Registry** | Storage for images | Azure Container Registry |
| **Dockerfile** | Instructions to build an image | Recipe for your container |

<details>
<summary>📚 <b>Learn More About Containers</b></summary>

| 📘 Resource | ⏱️ Time | 🔗 Link |
|:-----------|:--------|:--------|
| Introduction to Containers | 45 min | [Microsoft Learn](https://learn.microsoft.com/en-us/training/modules/intro-to-containers/) |
| Docker Fundamentals | 60 min | [Docker Docs](https://docs.docker.com/get-started/) |
| Container vs VMs | 15 min | [Microsoft Learn](https://learn.microsoft.com/en-us/virtualization/windowscontainers/about/containers-vs-vm) |

</details>

---

## 👤 Creating an Azure Account

### 📝 Step 1: Go to Azure Portal

1. 🌐 Open your web browser
2. 🔗 Navigate to: **https://portal.azure.com**

> 📸 **Portal Preview:**
> ![Azure Portal Login](https://learn.microsoft.com/en-us/azure/azure-portal/media/azure-portal-overview/azure-portal-overview-portal-callouts.png)
> *Source: [Microsoft Learn - Azure Portal Overview](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-overview)*

### 📝 Step 2: Create a Free Account (If Needed)

If you don't have an Azure account:

1. Click **"Start free"** or go to [azure.microsoft.com/free](https://azure.microsoft.com/free/)
2. Sign in with your Microsoft account (or create one)
3. Verify your identity with a phone number
4. Enter credit card information (for verification only)
5. Agree to terms and click **"Sign up"**

> 🎁 **Free Account Benefits:**
> - 💵 $200 credit for 30 days
> - 📅 12 months of popular free services
> - ♾️ 55+ services always free

### 📝 Step 3: Verify Your Account

After signing up:
1. ✉️ Check your email for a confirmation
2. 🔑 Log in to [portal.azure.com](https://portal.azure.com)
3. ✅ You should see the Azure Portal dashboard

> 🎬 **Video Tutorial:** [Create an Azure Account](https://learn.microsoft.com/en-us/training/modules/create-an-azure-account/)

---

## 🖥️ Navigating the Azure Portal

### 🗺️ The Portal Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ☰  Microsoft Azure                    🔍 Search    ⚙️ ☁️ ? 🔔 👤    │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│  🏠 Home │           MAIN CONTENT AREA                             │
│          │                                                          │
│  ➕ Create│   ┌──────────────────────────────────────────────┐     │
│          │   │                                                │     │
│  📁 All  │   │     Dashboard / Resource Details               │     │
│  Resources│   │     / Service Configuration                    │     │
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

### 🎯 Key Areas to Know

| 📍 Area | 📌 Location | 🎯 Purpose |
|:--------|:-----------|:----------|
| **🔍 Search Bar** | Top center | Find any Azure service quickly |
| **☁️ Cloud Shell** | Top right (☁️ icon) | Command-line in browser |
| **🔔 Notifications** | Top right (🔔 icon) | See deployment status |
| **📁 Left Menu** | Left side | Navigate to resources |
| **➕ Create Resource** | Left menu (➕) | Create new services |

### 🔎 Finding Things Quickly

<details>
<summary>🔍 <b>Method 1: Search Bar (Recommended)</b></summary>

1. Click the search bar (or press `/`)
2. Type what you're looking for: "container apps", "sql database", etc.
3. Click the result

</details>

<details>
<summary>📁 <b>Method 2: All Resources</b></summary>

1. Click "All resources" in the left menu
2. See everything in your subscription
3. Use filters to narrow down

</details>

<details>
<summary>📂 <b>Method 3: Resource Groups</b></summary>

1. Click "Resource groups" in the left menu
2. Click your resource group
3. See all resources in that group

</details>

> 📚 **Reference:** [Azure Portal Overview](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-overview)

---

## ☁️ Azure Cloud Shell

### 🤔 What is Cloud Shell?

**Azure Cloud Shell** is a command-line terminal that runs in your web browser. It's like having a Linux computer inside Azure that's already set up with all the tools you need.

### ✨ Why Use Cloud Shell?

| ✨ Benefit | 📝 Description |
|:----------|:--------------|
| 📦 **No installation needed** | Everything is pre-installed |
| 🌐 **Always available** | Access from any computer |
| 💾 **Persistent storage** | Your files are saved |
| 🔐 **Pre-authenticated** | Already logged into your Azure account |
| 🆓 **Free** | Included with your Azure subscription |

### 🚀 Starting Cloud Shell

1. 🔑 Log in to [portal.azure.com](https://portal.azure.com)
2. 🖱️ Click the **Cloud Shell icon** (☁️) in the top menu bar

![Cloud Shell Button](https://learn.microsoft.com/en-us/azure/cloud-shell/media/overview/portal-launch-icon.png)
*Source: [Microsoft Learn - Cloud Shell Overview](https://learn.microsoft.com/en-us/azure/cloud-shell/overview)*

3. 🐧 First time only: Choose **Bash** or **PowerShell** (we recommend Bash)
4. 💾 First time only: Create a storage account (click "Create storage")
5. ⏳ Wait for the shell to initialize

### 💻 Cloud Shell Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│ ☁️ Cloud Shell                                              _ □ X   │
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

### 🔧 Basic Commands to Try

```bash
# 👀 See your Azure subscription
az account show

# 📋 List your resource groups
az group list --output table

# ❓ Get help
az --help
```

> 📚 **Learn More:** [Azure Cloud Shell Quickstart](https://learn.microsoft.com/en-us/azure/cloud-shell/quickstart)

---

## 💰 Understanding Costs

### 💳 How Azure Billing Works

Azure charges you for resources **while they're running**. Think of it like a utility bill.

```
┌─────────────────────────────────────────────────────────────┐
│                    💰 AZURE BILLING                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⏱️ Resource Running Time  ×  💵 Resource Price  =  📧 Your Bill │
│                                                              │
│  📝 Example:                                                 │
│  Container App running 720 hours × $0.05/hour = $36/month  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 💡 Cost-Saving Tips

| 💡 Tip | 💰 How It Saves Money |
|:------|:---------------------|
| **📉 Scale to Zero** | Container Apps can scale to 0 replicas when idle = $0 |
| **🆓 Use Free Tiers** | Many services have free tiers for small workloads |
| **🗑️ Delete Unused Resources** | Don't pay for things you're not using |
| **🧪 Use Dev/Test Pricing** | Lower prices for non-production workloads |
| **⚠️ Set Budget Alerts** | Get notified before you overspend |

### 📊 Estimated Costs for This Project

| 🔧 Resource | 💵 Estimated Monthly Cost | 📝 Notes |
|:-----------|:------------------------|:--------|
| Container Apps | $0 - $50 | Scale-to-zero when idle |
| Azure SQL Database | $5 - $15 | Basic tier |
| Container Registry | $5 | Basic tier |
| Front Door | $35 | Standard tier |
| Log Analytics | $0 - $5 | Free tier available |
| **📊 Total Estimate** | **$45 - $110** | Varies with usage |

> ⚠️ **Note:** These are estimates. Actual costs depend on usage, region, and configuration.

### 📈 Viewing Your Costs

1. 🔍 Search for **"Cost Management"** in the Azure Portal
2. 📊 Click **"Cost analysis"**
3. 👀 See spending by service, resource group, or time period

> 📚 **Reference:** [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)

---

## 🚀 Next Steps

You're now ready to start deploying! Choose your path:

<table>
<tr>
<td width="50%" valign="top">

### 🖱️ Path A: Visual Deployment (Azure Portal)

Best for beginners who prefer clicking through a visual interface.

**You'll use:**
- 🌐 Web browser
- 🖥️ Azure Portal interface

[![Start Portal Guide](https://img.shields.io/badge/▶_Start_Portal_Guide-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](./beginners-guide-portal.md)

</td>
<td width="50%" valign="top">

### ⌨️ Path B: Command-Line Deployment (Cloud Shell)

Best for those who want to learn Azure CLI commands.

**You'll use:**
- ☁️ Azure Cloud Shell
- 💻 Azure CLI commands

[![Start CLI Guide](https://img.shields.io/badge/▶_Start_CLI_Guide-326CE5?style=for-the-badge&logo=powershell&logoColor=white)](./cloud-shell-deployment-guide.md)

</td>
</tr>
</table>

---

## 📋 Quick Reference

### 🔗 Useful Links

| 🔧 Resource | 🔗 Link |
|:-----------|:--------|
| 🌐 Azure Portal | https://portal.azure.com |
| 📊 Azure Status | https://status.azure.com |
| 💰 Azure Pricing | https://azure.microsoft.com/pricing |
| 📚 Microsoft Learn | https://learn.microsoft.com |
| 📖 Azure CLI Reference | https://learn.microsoft.com/cli/azure |

### 💻 Common Azure CLI Commands

```bash
# 🔐 Login to Azure
az login

# 📋 List subscriptions
az account list --output table

# ✅ Set active subscription
az account set --subscription "Your Subscription Name"

# 📁 List resource groups
az group list --output table

# ➕ Create a resource group
az group create --name myResourceGroup --location eastus

# 📦 List resources in a group
az resource list --resource-group myResourceGroup --output table
```

---

## 📖 Glossary

| 🏷️ Term | 📝 Definition |
|:--------|:-------------|
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

### 🎉 Ready to continue?

[![Portal Guide](https://img.shields.io/badge/🖱️_Portal_Guide-0078D4?style=for-the-badge)](./beginners-guide-portal.md)
[![Cloud Shell Guide](https://img.shields.io/badge/☁️_Cloud_Shell_Guide-326CE5?style=for-the-badge)](./cloud-shell-deployment-guide.md)
[![Back to Index](https://img.shields.io/badge/📚_Back_to_Index-gray?style=for-the-badge)](./index.md)

---

**Made with ❤️ for Azure beginners**

</div>
