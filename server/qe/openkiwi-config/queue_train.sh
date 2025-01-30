#!/usr/bin/env bash

# first argument should be the experiment name, usually predictor/estimator

#/home/bojar/tools/shell/qsubmit --mem=16G --queue="cpu-ms.q" "./wrap.py $1"
qsub -cwd -o log-$1 -e log-$1-error -l mem_free=16G -b y ./wrap.py $1
