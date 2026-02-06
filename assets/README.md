# Architecture Diagrams

This folder contains enterprise-detailed Excalidraw diagrams for the DOT Transportation Data Portal, enhanced with official Azure product icons.

## Diagram Files

| File | Description | Azure Icons Added |
|------|-------------|-------------------|
| `architecture.excalidraw` | Main system architecture - Azure services, data flow, components | Front Door, Container Apps, SQL Database, ACR, Storage, Entra ID, App Insights, Log Analytics |
| `deployment-architecture.excalidraw` | CI/CD pipeline, GitHub Actions, Bicep infrastructure | Container Registry, Container Apps |
| `security-architecture.excalidraw` | Defense-in-depth security layers | Front Door, SQL Database |
| `data-flow-architecture.excalidraw` | Request/response flow, REST/GraphQL, database schema | Front Door, Container Apps |
| `monitoring-architecture.excalidraw` | Application Insights, Log Analytics, dashboards | Container Apps, SQL Database, ACR, Front Door |
| `auto-scaling-architecture.excalidraw` | KEDA HTTP scaling, replica management | Container Apps |
| `authentication-flow.excalidraw` | OAuth 2.0/OIDC sequence with Entra ID | Active Directory |

## How to View/Edit

### VS Code (Recommended)

1. Install the **Excalidraw extension**: `pomdtr.excalidraw-editor`
2. Open any `.excalidraw` file directly in VS Code
3. Edit using the visual editor

### Excalidraw.com

1. Go to [excalidraw.com](https://excalidraw.com)
2. File → Open → Select the `.excalidraw` file
3. Edit and save

### Obsidian

1. Install the Excalidraw plugin for Obsidian
2. Open diagrams directly in your vault

## Exporting to PNG/SVG

### Method 1: VS Code Extension

1. Open the `.excalidraw` file
2. Click the export button (top-right toolbar)
3. Choose PNG or SVG
4. Select scale (2x recommended for documentation)

### Method 2: Excalidraw.com

1. Open the diagram in excalidraw.com
2. Select All (Ctrl+A)
3. Export (Ctrl+Shift+E)
4. Choose format and options

### Method 3: Command Line (Node.js)

```bash
# Install CLI
npm install -g @excalidraw/excalidraw

# Export all diagrams
for file in *.excalidraw; do
  npx @excalidraw/cli export "$file" --format png --scale 2 --output "${file%.excalidraw}.png"
  npx @excalidraw/cli export "$file" --format svg --output "${file%.excalidraw}.svg"
done
```

## Azure Icons Status

**All diagrams have been updated with official Azure product icons** from the Excalidraw libraries. The icons are embedded directly in the `.excalidraw` files.

### Icons Added (25 total across 7 diagrams)

| Diagram | Icons Added |
|---------|-------------|
| `architecture.excalidraw` | Front Door, Container Apps (x2), Azure SQL Database, Container Registry, Blob Storage, Active Directory, Application Insights, Log Analytics |
| `authentication-flow.excalidraw` | Active Directory |
| `auto-scaling-architecture.excalidraw` | Container Apps (x2) |
| `data-flow-architecture.excalidraw` | Front Door, Container Apps (x2) |
| `deployment-architecture.excalidraw` | Container Registry, Container Apps |
| `monitoring-architecture.excalidraw` | Container Apps (x2), Azure SQL Database, Container Registry, Front Door |
| `security-architecture.excalidraw` | Front Door (x2), Azure SQL Database |

### Icon Libraries Used

Icons were sourced from these Excalidraw libraries:
- `microsoft-azure-cloud-icons.excalidrawlib` - Azure SQL Database
- `azure-cloud-services.excalidrawlib` - Active Directory, Application Insights, Blob Storage
- `azure-compute.excalidrawlib` - Container Apps
- `azure-containers.excalidrawlib` - Container Registry
- `azure-network.excalidrawlib` - Front Door

### Adding More Icons

To add additional Azure icons:

1. Open the `.excalidraw` file in VS Code (with Excalidraw extension) or excalidraw.com
2. Press `0` to open the library panel
3. Load libraries from `~/.claude/skills/excalidraw/libraries/azure/`
4. Drag icons onto the canvas
5. Save the file

## Adding Azure Icons (Online)

For official Azure icons in Excalidraw:

1. Visit [libraries.excalidraw.com](https://libraries.excalidraw.com)
2. Search for "Azure" or specific services
3. Click "Add to Excalidraw" to load the library
4. Icons appear in your library panel (press `0` to open)

### Recommended Libraries

- **Azure Cloud Services** - App Service, Functions, SQL, Storage
- **Azure Network** - Front Door, VPN, Firewall, Load Balancer
- **Azure Containers** - AKS, ACR, Container Instances
- **Microsoft 365** - Entra ID, Teams, SharePoint

## Diagram Conventions

### Color Coding

| Color | Meaning |
|-------|---------|
| `#0078D4` (Blue) | Azure services, containers, storage |
| `#107C10` (Green) | DAB/API components, success states |
| `#E81123` (Red) | Network edge, Front Door, alerts |
| `#FFB900` (Yellow) | Identity/Auth, Entra ID |
| `#5C2D91` (Purple) | Container Registry, monitoring |
| `#008272` (Teal) | Log Analytics, observability |
| `#424242` (Gray) | Users, legends, neutral elements |

### Arrow Styles

| Style | Meaning |
|-------|---------|
| Solid | Data flow (requests, responses) |
| Dashed | Configuration, authentication |
| Dotted | Telemetry, logging |

### Box Styles

- **Rounded corners**: Services and components
- **Square corners**: Data/tables
- **Nested boxes**: Resource groups, environments

## Updating Diagrams

When infrastructure changes:

1. Update the relevant `.excalidraw` file
2. Export new PNG/SVG versions
3. Update documentation references
4. Commit all changes together

## File Size Guidelines

- Excalidraw files: ~20-50 KB each
- SVG exports: ~10-30 KB each
- PNG exports (2x): ~100-500 KB each

Keep diagrams focused - create separate files for different aspects rather than one massive diagram.
