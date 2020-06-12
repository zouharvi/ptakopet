#!/usr/bin/env bash
./load.py logs/ -b3 out.blog3

echo "No Czech knowledge people || Estonian model"
./preliminary.py out.blog3 --filter 1

echo ""
echo "-----"
echo ""

echo "Some Czech knowledge && Czech Model"
./preliminary.py out.blog3 --filter 2

rm out.blog3