#!/bin/bash

# Wait for Hasura to be ready
echo "Waiting for Hasura to be ready..."
until $(curl --output /dev/null --silent --fail http://localhost:8080/healthz); do
  printf '.'
  sleep 5
done

echo -e "\nHasura is up and running!"

# Apply migrations
echo "Applying database migrations..."
hasura migrate apply --endpoint http://localhost:8080 --admin-secret myadminsecretkey --database-name default

# Apply metadata
echo "Applying Hasura metadata..."
hasura metadata apply --endpoint http://localhost:8080 --admin-secret myadminsecretkey

echo "Hasura initialization completed!"
echo "You can now access the Hasura console at: http://localhost:8080/console"
echo "Admin secret: myadminsecretkey" 