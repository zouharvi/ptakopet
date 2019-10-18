#!/usr/bin/env python3

def withoutBacktracking(segments):
    out = []
    for segment in segments:
        translates = prefixMap(segment, 'TRANSLATE1', lambda x: x[2])
        if len(translates) == 0:
            continue
        prev = ''
        ok = True
        for line in translates:
            if line.startswith(prev):
                prev = line
            else:
                ok = False
                break
        if ok:
            out.append([line, len(segment)])
    print('Number of all segments:', len(segments))
    print('Number of segments without backtracking:', len(out))
    return out