#!/bin/bash

fuser -k 3000/tcp

sleep 1

nodemon --ignore public/ --ignore downloads/