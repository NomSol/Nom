SET check_function_bodies = false;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "User" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "email" text UNIQUE NOT NULL,
    "password" text NOT NULL,
    "name" text,
    "image" text,
    "points" integer DEFAULT 0,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

CREATE TABLE "Treasure" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "location" jsonb NOT NULL,
    "creatorId" uuid NOT NULL,
    "points" integer NOT NULL,
    "isFound" boolean DEFAULT false,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);
