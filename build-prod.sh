#!/bin/bash
set -e

export GITREV=`git log -1 --format="%H"`
export VERSION="SNAPSHOT-$GITREV"
export GEOSTORE_REPO="git@gitlab.com:cnrmaps/geostore.git"
export REQUIRE_GEOSTORE_INSTALL="false"

if [ $REQUIRE_GEOSTORE_INSTALL == "true" ]
then
  echo "Clone geostore"
  git clone $GEOSTORE_REPO
  cd ./geostore/
  echo "Install geostore"
  mvn clean install -Pextjs,h2_disk
  cd ../
  echo "Remove geostore"
  rm -Rf geostore
fi

npm install
npm run clean
npm run mkdirp
npm run prod
npm run compile

if [ $# -eq 0 ]
  then
    mvn clean install -Dmapstore2.version=$VERSION
  else
    mvn clean install -Dmapstore2.version=$1
fi

npm run afterprod
