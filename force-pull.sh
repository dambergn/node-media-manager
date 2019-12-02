#!/bin/bash

echo 'Forcing pull'

git fetch --all
git reset --hard orign/master
git pull origin master

echo 'Force pull complete'