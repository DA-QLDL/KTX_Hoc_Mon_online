#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
cp config/vercel.json vercel.json
echo "Deployment config copied to web root."
