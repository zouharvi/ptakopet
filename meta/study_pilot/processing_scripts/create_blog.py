#!/usr/bin/env python3
import argparse
import pickle
import re
from utils import prefixMap, firstViableSrc, firstViableTrg, isWithoutBacktracking

# Get segment domain
def getSID(segment):
    firstNext = prefixMap(segment, 'NEXT', lambda x: x['sid'])
    if len(firstNext) == 0:
        raise Exception('Domain could not be found')
    else:
        return firstNext[0]

def createBlog(segments):
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