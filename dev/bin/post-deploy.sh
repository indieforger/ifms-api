#!/usr/bin/env bash

expLoc='dev/bin/post-deploy.sh'
curLoc="${BASH_SOURCE[0]}"

if [[ ! "$curLoc" =~ "$expLoc" ]]; then
    echo 'You can run this script from project root directory only'
    exit 1
fi

echo "[post-deploy] setting up paths"
./dev/bin/server-paths.sh

echo "npm update"
rm -Rf node_modules
npm install

echo "[post-deploy] start server"
./dev/bin/server-start.sh

exit 0