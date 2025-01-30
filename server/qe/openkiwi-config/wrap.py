#!/usr/bin/env python3

# first argument should be the experiment name, usually predictor/estimator

import kiwi
import sys

config = f"./experiments/train_{sys.argv[1]}.yaml"
kiwi.train(config)

#if len(sys.argv) == 3 and sys.argv[1] == 'train':
#    config = f'experiments/train_{sys.argv[2]}.yaml'
#    kiwi.train(config)
#elif len(sys.argv) == 3 and sys.argv[1] == 'predict':
#    config = f'experiments/predict_estimator_{sys.argv[2]}.yaml'
#    kiwi.train(config)
