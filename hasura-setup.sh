#!/bin/bash

# Create a .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOL
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nom_db
POSTGRES_PORT=5432

# Hasura Configuration
HASURA_ADMIN_SECRET=myadminsecretkey
HASURA_GRAPHQL_ENABLE_CONSOLE=true
HASURA_GRAPHQL_DEV_MODE=true
HASURA_GRAPHQL_UNAUTHORIZED_ROLE=anonymous
HASURA_GRAPHQL_LOG_LEVEL=debug

# Next.js Configuration
NEXT_PUBLIC_HASURA_GRAPHQL_API=http://localhost:8080/v1/graphql
NEXT_PUBLIC_HASURA_REST_API=http://localhost:8080/api/rest
NEXT_PUBLIC_HASURA_ADMIN_SECRET=myadminsecretkey
EOL
fi

# Create migrations directory if it doesn't exist
mkdir -p hasura/migrations/default/1_init

# Create schema migration file
cat > hasura/migrations/default/1_init/up.sql << EOL
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname TEXT NOT NULL,
    avatar_url TEXT,
    cath_id INTEGER,
    ip_location TEXT,
    description TEXT,
    email TEXT,
    wallet_address TEXT UNIQUE,
    wallet_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create treasures table
CREATE TABLE treasures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    points INTEGER NOT NULL DEFAULT 1,
    hint TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    image_url TEXT,
    verification_code TEXT NOT NULL,
    creator_id UUID REFERENCES users(id),
    finder_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    likes_count INTEGER DEFAULT 0
);

-- Create likes table
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    treasure_id UUID REFERENCES treasures(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, treasure_id)
);

-- Create trigger to update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS \$\$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE treasures SET likes_count = likes_count + 1 WHERE id = NEW.treasure_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE treasures SET likes_count = likes_count - 1 WHERE id = OLD.treasure_id;
  END IF;
  RETURN NULL;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Create matches table for user game interactions
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    treasure_id UUID REFERENCES treasures(id) NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, treasure_id)
);
EOL

# Create metadata directory if it doesn't exist
mkdir -p hasura/metadata

# Create basic metadata
cat > hasura/metadata/tables.yaml << EOL
- table:
    schema: public
    name: users
  array_relationships:
    - name: treasures_created
      using:
        foreign_key_constraint_on:
          column: creator_id
          table:
            schema: public
            name: treasures
    - name: treasures_found
      using:
        foreign_key_constraint_on:
          column: finder_id
          table:
            schema: public
            name: treasures
    - name: likes
      using:
        foreign_key_constraint_on:
          column: user_id
          table:
            schema: public
            name: likes

- table:
    schema: public
    name: treasures
  object_relationships:
    - name: creator
      using:
        foreign_key_constraint_on: creator_id
    - name: finder
      using:
        foreign_key_constraint_on: finder_id
  array_relationships:
    - name: likes
      using:
        foreign_key_constraint_on:
          column: treasure_id
          table:
            schema: public
            name: likes

- table:
    schema: public
    name: likes
  object_relationships:
    - name: user
      using:
        foreign_key_constraint_on: user_id
    - name: treasure
      using:
        foreign_key_constraint_on: treasure_id
EOL

echo "Hasura setup files created."
echo "To start Hasura and PostgreSQL, run: docker-compose up -d"
echo "Access Hasura console at: http://localhost:8080/console"
echo "Admin secret: myadminsecretkey" 