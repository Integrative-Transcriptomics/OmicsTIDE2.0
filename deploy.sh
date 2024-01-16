#!/bin/bash
# This script is used to deploy the <your-app> application
docker ps -a --filter ancestor='omicstide' --format='{{.ID}}'|xargs docker stop|xargs docker remove
# remove the (old) image
docker image rm omicstide
# load the image from the tar file
docker load --input omicstide.tar.gz
# run the container
docker run -dp 0.0.0.0:$1:5000/tcp omicstide