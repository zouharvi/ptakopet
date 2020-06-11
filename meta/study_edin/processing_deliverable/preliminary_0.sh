#!/usr/bin/env bash

echo "No Czech knowledge"
./load.py logs_0/ -b3 out.blog3
./preliminary.py out.blog3

echo "-----"
echo "Some Czech knowledge"
./load.py logs_1/ -b3 out.blog3
./preliminary.py out.blog3

rm out.blog3