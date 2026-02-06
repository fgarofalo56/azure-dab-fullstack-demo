# Architecture Diagrams

This folder contains enterprise-detailed Excalidraw diagrams for the DOT Transportation Data Portal.

## Diagram Files

| File | Description |
|------|-------------|
| `architecture.excalidraw` | Main system architecture - Azure services, data flow, components |
| `deployment-architecture.excalidraw` | CI/CD pipeline, GitHub Actions, Bicep infrastructure |
| `security-architecture.excalidraw` | Defense-in-depth security layers |
| `data-flow-architecture.excalidraw` | Request/response flow, REST/GraphQL, database schema |
| `monitoring-architecture.excalidraw` | Application Insights, Log Analytics, dashboards |
| `auto-scaling-architecture.excalidraw` | KEDA HTTP scaling, replica management |
| `authentication-flow.excalidraw` | OAuth 2.0/OIDC sequence with Entra ID |

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

## Replacing Placeholder Icons with Production Icons

The diagrams contain `[REPLACE: ...]` markers indicating which official Azure icons should be used. Follow these steps to replace them with production-quality icons from Excalidraw libraries.

### Step 1: Load Required Libraries

**In VS Code (with Excalidraw extension):**
1. Open the `.excalidraw` file
2. Press `0` to open the library panel
3. Click the folder icon (Open)
4. Navigate to `C:\Users\{username}\.claude\skills\excalidraw\libraries\azure\`
5. Load these libraries:
   - `azure-cloud-services.excalidrawlib`
   - `azure-compute.excalidrawlib`
   - `azure-containers.excalidrawlib`
   - `azure-network.excalidrawlib`
   - `microsoft-azure-cloud-icons.excalidrawlib`
6. For GitHub icons, load from `...\devops\github-actions.excalidrawlib`
7. For architecture components, load from `...\software-architecture\architecture-diagram-components.excalidrawlib`

**Or download from online:**
1. Visit [libraries.excalidraw.com](https://libraries.excalidraw.com)
2. Search for "Azure" and add relevant libraries
3. For icons not in local libraries, search for "Log Analytics" etc.

### Step 2: Find and Replace Icons

1. Open the diagram in Excalidraw
2. Search for `[REPLACE:` text elements
3. Delete the placeholder text element
4. Drag the corresponding icon from your loaded library
5. Position and resize the icon as needed (60x60 or 80x80 px recommended)

### Icon Mapping Reference

| Placeholder Marker | Library File | Icon Name |
|--------------------|--------------|-----------|
| `[REPLACE: Azure logo...]` | azure-cloud-services.excalidrawlib | Azure logo |
| `[REPLACE: Front Door Profiles...]` | azure-network.excalidrawlib | Front Door Profiles |
| `[REPLACE: Container Apps...]` | azure-compute.excalidrawlib | Container Apps |
| `[REPLACE: Azure SQL Database...]` | microsoft-azure-cloud-icons.excalidrawlib | Azure SQL Database |
| `[REPLACE: Container Registries...]` | azure-containers.excalidrawlib | Container Registries |
| `[REPLACE: Blob Storage...]` | azure-cloud-services.excalidrawlib | Blob Storage |
| `[REPLACE: Active Directory...]` | azure-cloud-services.excalidrawlib | Active Directory |
| `[REPLACE: Application Insights...]` | azure-cloud-services.excalidrawlib | Application Insights |
| `[REPLACE: User icon...]` | architecture-diagram-components.excalidrawlib | User |
| `[REPLACE: Device icon...]` | architecture-diagram-components.excalidrawlib | Device |
| `[REPLACE: GitHub...]` | github-actions.excalidrawlib | GitHub |
| `[REPLACE: Download Log Analytics...]` | Download from libraries.excalidraw.com | Log Analytics |

### Local Library Locations

If using the Excalidraw skill libraries:

```
C:\Users\{username}\.claude\skills\excalidraw\libraries\
├── azure/
│   ├── azure-cloud-services.excalidrawlib
│   ├── azure-compute.excalidrawlib
│   ├── azure-containers.excalidrawlib
│   ├── azure-network.excalidrawlib
│   └── microsoft-azure-cloud-icons.excalidrawlib
├── devops/
│   └── github-actions.excalidrawlib
└── software-architecture/
    └── architecture-diagram-components.excalidrawlib
```

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
