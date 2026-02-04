# Azure Data API Builder Container
# Based on official DAB image

FROM mcr.microsoft.com/azure-databases/data-api-builder:latest

# Use the base image's working directory (contains the DAB DLLs)
WORKDIR /App

# Copy DAB configuration to the App directory
COPY dab-config.json /App/dab-config.json

# Environment variables (override at runtime)
ENV DATABASE_CONNECTION_STRING=""
ENV AZURE_AD_CLIENT_ID=""
ENV AZURE_AD_TENANT_ID=""
ENV ASPNETCORE_ENVIRONMENT="Production"

# Expose DAB default port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

# Start DAB with configuration file
ENTRYPOINT ["dotnet", "Azure.DataApiBuilder.Service.dll", "--ConfigFileName", "/App/dab-config.json"]
