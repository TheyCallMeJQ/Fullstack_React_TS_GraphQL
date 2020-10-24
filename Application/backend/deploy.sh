#!/bin/bash

echo What should this build and deploy be versioned as \(i.e. 1.0.1, 1.2\)?
read VERSION

docker build -t theycallmejq/lireddit:$VERSION .
docker push theycallmejq/lireddit:$VERSION

#The things in quotes are commands to be run on the server
ssh root@142.93.8.164 "docker pull theycallmejq/lireddit:$VERSION && docker tag theycallmejq/lireddit:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"