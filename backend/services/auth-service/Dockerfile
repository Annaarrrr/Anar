# Build Stage - Upgraded to 9.0
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# 1. Copy only the project file first using the correct path from the repo root
COPY backend/services/auth-service/auth-service.csproj backend/services/auth-service/

# 2. Restore dependencies
RUN dotnet restore backend/services/auth-service/auth-service.csproj

# 3. Copy the rest of the auth service code
COPY backend/services/auth-service/ backend/services/auth-service/

# 4. Set the working directory to the service folder to build and publish
WORKDIR /src/backend/services/auth-service
RUN dotnet publish auth-service.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage - Upgraded to 9.0
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Expose port 3001 to match our docker-compose.yml mapping
EXPOSE 3001

# Copy the compiled application from the build stage
COPY --from=build /app/publish .

# Start the .NET application
ENTRYPOINT ["dotnet", "auth-service.dll"]