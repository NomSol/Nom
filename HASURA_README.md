# Hasura Database Setup for Nom Project

This document provides instructions for setting up the Hasura GraphQL Engine and PostgreSQL database for the Nom project.

## Prerequisites

- Docker and Docker Compose
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop) for Mac, Windows, or Linux
  - Docker Compose comes included with Docker Desktop
- Node.js and npm (for running the Next.js application)
- (Optional) Hasura CLI for advanced management
  - Install with: `npm install --global hasura-cli`

## Installation

### 1. Install Docker

If you don't have Docker installed:

1. Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Start Docker Desktop and make sure it's running
3. Verify installation with: `docker --version` and `docker compose version`

### 2. Run the setup script to create necessary files:

```bash
./hasura-setup.sh
```

This script creates:
- A `.env` file with required environment variables
- Migration files for database schema
- Metadata files for Hasura configuration

### 3. Start the services:

```bash
docker compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Hasura GraphQL Engine on port 8080

### 4. Initialize Hasura (after services are up):

```bash
./hasura-init.sh
```

This script:
- Waits for Hasura to be ready
- Applies database migrations
- Applies Hasura metadata

### 5. Access Hasura Console:

Open your browser and navigate to:
```
http://localhost:8080/console
```

Admin Secret: `myadminsecretkey`

## Connecting Next.js to Hasura

To connect your Next.js application to Hasura:

1. Create a `.env.local` file in your project root with:

```
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Hasura GraphQL API
NEXT_PUBLIC_HASURA_GRAPHQL_API=http://localhost:8080/v1/graphql
NEXT_PUBLIC_HASURA_REST_API=http://localhost:8080/api/rest
NEXT_PUBLIC_HASURA_ADMIN_SECRET=myadminsecretkey

# Mapbox (for map functionality)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
```

2. Restart your Next.js development server to apply the changes:

```bash
npm run dev
```

3. The wallet authentication system will now use Hasura for storing user profiles and data.

## Database Schema

The database includes the following tables:

- **users**: Stores user profile information including wallet addresses
- **treasures**: Stores treasure information (location, description, status)
- **likes**: Tracks users' likes on treasures
- **matches**: Tracks user interactions with treasures

## REST API Endpoints

The following REST endpoints are configured:

- `GET /api/rest/wallet_user`: Get a user profile by wallet address
- `POST /api/rest/createuserprofile`: Create a new user profile
- `PATCH /api/rest/modifyuserprofile`: Modify an existing user profile

## Environment Variables

For the Next.js application to connect to Hasura, make sure these environment variables are set:

```
NEXT_PUBLIC_HASURA_GRAPHQL_API=http://localhost:8080/v1/graphql
NEXT_PUBLIC_HASURA_REST_API=http://localhost:8080/api/rest
NEXT_PUBLIC_HASURA_ADMIN_SECRET=myadminsecretkey
```

## Manual Hasura CLI Usage

If you have the Hasura CLI installed, you can use these commands:

```bash
# Apply migrations
hasura migrate apply --endpoint http://localhost:8080 --admin-secret myadminsecretkey

# Apply metadata
hasura metadata apply --endpoint http://localhost:8080 --admin-secret myadminsecretkey

# Export metadata (after making changes in console)
hasura metadata export --endpoint http://localhost:8080 --admin-secret myadminsecretkey
```

## Troubleshooting

- If you encounter permission issues with the scripts, run `chmod +x hasura-setup.sh hasura-init.sh`
- If Hasura can't connect to PostgreSQL, check the logs with `docker compose logs hasura`
- For database issues, check PostgreSQL logs with `docker compose logs postgres`
- If Docker commands fail, make sure Docker Desktop is running
- If you can't access Hasura console, ensure ports 8080 and 5432 are not in use by other applications 