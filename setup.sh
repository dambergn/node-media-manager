#/bin/bash

echo "setting npm user home directory"
sudo chown -R $USER:$(id -gn $USER) $HOME/.config

echo "installing NPM packages"
npm install