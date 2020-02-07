#!/usr/bin/env python3

import json
from read_stimuli import stimuliList

out = dict()
for stimuli in stimuliList:
    out[stimuli] = f"<img src='https://ptakopet.vilda.net/stable/edin/{stimuli}.png'>"

if __name__ == '__main__':
    print(json.dumps(out))