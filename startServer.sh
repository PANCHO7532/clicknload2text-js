#!/bin/sh
if [ -f "./cnl2text.js" ]; then
    xterm -title "Click'n'Load to Text" -e "sh -c \"node $PWD/cnl2text.js\""
    exit
else
    echo "[ERROR] - Main script not detected!"
    sleep 5
    exit
fi