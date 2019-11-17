#!/usr/bin/env python3
import argparse
import pickle
import re
from utils import prefixMap, firstViableSrc, firstViableTrg, isWithoutBacktracking

# This script processes blog1 binary file and outputs corresponding blog2 file

# parser = argparse.ArgumentParser(description='')
# parser.add_argument('blog1file',  help='Path to the binary log 1 (.blog1) file in question')
# parser.add_argument('blog2file',  help='Path to the binary log 2 (.blog2) file in question')
# args = parser.parse_args()

# Get segment domain
def getSID(segment):
    firstNext = prefixMap(segment, 'NEXT', lambda x: x['sid'])
    if len(firstNext) == 0:
        raise Exception('Domain could not be found')
    else:
        return firstNext[0]

def createBlog2(segments):
    newSegments = []
    for seg in segments:
        newSeg = dict()
        newSeg['usid'] = seg[0]['usid']
        newSeg['items'] = []
        for line in seg:
            newLine = dict(line)
            del newLine['usid']
            newSeg['items'].append(newLine)
        newSeg['sid'] = getSID(newSeg)
        newSeg['domain'] = newSeg['sid'][0]
        newSeg['rating'] = dict()

        # Add first viable object by source
        firstViableObj = firstViableSrc(newSeg)
        newSeg['first_viable_src'] = firstViableObj

        # Add first viable object by target
        firstViableObj = firstViableTrg(newSeg)
        newSeg['first_viable_trg'] = firstViableObj

        # Add final object
        lastConfirm = prefixMap(newSeg, 'CONFIRM')
        if len(lastConfirm) == 0:
            newSeg['final'] = None
        else:
            newSeg['final'] = lastConfirm[-1]

        newSeg['backtracking'] = not isWithoutBacktracking(newSeg)
        newSegments.append(newSeg)
    return newSegments

# with open(args.blog1file, 'rb') as f:
#     segments = pickle.load(f)

# with open(args.blog2file, 'wb') as f:
#     pickle.dump(createBlog2(segments), f)