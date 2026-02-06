# Documentation Images

This folder contains local images and references for the DOT Transportation Data Portal documentation.

## Image Strategy

### Microsoft Learn Images
Most Azure Portal screenshots link directly to Microsoft Learn documentation images to ensure they stay current with Azure updates. Format:
```markdown
![Alt Text](https://learn.microsoft.com/en-us/azure/.../media/image-name.png)
```

### Local Images
Project-specific screenshots and diagrams are stored in this folder:
- Custom diagrams
- Application screenshots
- Workflow illustrations

### Excalidraw Diagrams
Architecture diagrams are stored in `/assets/` as `.excalidraw` files with embedded Azure icons.

## Image Naming Convention

```
{service}-{action}-{detail}.png
```

Examples:
- `portal-resource-group-create.png`
- `container-apps-environment-config.png`
- `github-actions-workflow-run.png`

## Badge Resources

Shields.io badges for status and technology indicators:
- https://shields.io/
- https://simpleicons.org/ (icon slugs)

## Microsoft Learn Image Sources

| Service | Documentation URL |
|---------|-------------------|
| Resource Groups | https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/ |
| SQL Database | https://learn.microsoft.com/en-us/azure/azure-sql/database/ |
| Container Registry | https://learn.microsoft.com/en-us/azure/container-registry/ |
| Container Apps | https://learn.microsoft.com/en-us/azure/container-apps/ |
| Entra ID | https://learn.microsoft.com/en-us/azure/active-directory/ |
| Front Door | https://learn.microsoft.com/en-us/azure/frontdoor/ |
| Key Vault | https://learn.microsoft.com/en-us/azure/key-vault/ |
