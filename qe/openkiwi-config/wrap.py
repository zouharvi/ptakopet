#!/usr/bin/env python3

import kiwi
import sys

if len(sys.argv) == 3 and sys.argv[1] == 'train':
    #predictor_config = 'experiments/train_predictor.yaml'
    estimator_config = sys.argv[2]
    kiwi.train(estimator_config)
