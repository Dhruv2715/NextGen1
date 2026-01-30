@echo off
dir > debug_dir.log 2>&1
node -v > debug_node.log 2>&1
npm -v > debug_npm.log 2>&1
echo DONE > debug_done.log
