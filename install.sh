#!/bin/bash
#
# install.sh
#
# Distributed under terms of the MIT license.
#

set -e

install_dir=${1:-"$HOME/profyle-portal"}
did_finish=0

red=$(echo -e '\x1b[1;91m')
green=$(echo -e '\x1b[1;92m')
blue=$(echo -e '\x1b[1;38;5;39m')
bold=$(echo -e '\x1b[1m')
reset=$(echo -e '\x1b[0m')

function onExit {
  if [ $did_finish -eq 0 ]; then
    echo "${red}Installation failed${reset}"
  else
    echo "${green}Installation completed succesfully${reset}"
    echo "Run with ${blue}$install_dir/bin/start-profyle${reset}"
  fi
}
trap onExit EXIT


# Test that git and nodejs are installed
if [[ -z $(command -v git) ]]; then
  echo "${red}Git is not installed or is not in path.${reset}"
  exit 1
fi
if [[ -z $(command -v node) ]] || [[ -z $(command -v npm) ]]; then
  echo "${red}NodeJS/NPM is not installed or is not in path.${reset}"
  exit 1
fi


# Print informations
echo "${bold}Installation directory: $install_dir${reset}"


# Clone & install packages
git clone https://github.com/PROFYLE-TFRI/portal $install_dir
cd $install_dir
npm install


# Echo empty lines so the user can see a separation between the log & the questions
echo ""
echo ""
echo ""

# Defer to scripts/install.js to complete the installation
node scripts/install.js



did_finish=1
