#!/bin/bash
# Script to handle Prisma generation during build
export DATABASE_URL="postgresql://temp:temp@localhost:5432/temp"
npx prisma generate
echo "Prisma client generated successfully"