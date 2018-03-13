#!/bin/bash
#
# install.sh
#
# Distributed under terms of the MIT license.
#

set -e

install_dir=${1:-'~/profyle-portal'}
did_finish=0

red=$(echo -e '\x1b[1;91m')
green=$(echo -e '\x1b[1;92m')
blue=$(echo -e '\x1b[1;38;5;39m')
reset=$(echo -e '\x1b[0m')

function onExit {
  if [ $did_finish -eq 0 ]; then
    echo "${red}Installation failed${reset}"
  else
    echo "${green}Installation completed succesfully${reset}"
    echo "Run with ${blue}npm start${reset}"
  fi
}
trap onExit EXIT


# Print informations
echo "Installation directory: $install_dir"


# Clone & install packages
git clone https://github.com/PROFYLE-TFRI/portal $install_dir
cd $install_dir
npm install


# Defer to scripts/install.js to complete the installation
node scripts/install.js



did_finish=1
