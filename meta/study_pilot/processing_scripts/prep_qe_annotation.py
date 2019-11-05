#!/usr/bin/env python3
import argparse
import pickle
import json

# Prepare quality estimation
# TODO

parser = argparse.ArgumentParser(description='')
parser.add_argument('blogfile',  help='Path to the binary log (.blog) file in question')
parser.add_argument('questions_flat',  help='Path to the questions_flat.json file')
parser.add_argument('--a0md', help='Path to the annotation markdown file')
parser.add_argument('--a0csv', help='Path to the annotation csv file')
args = parser.parse_args()

# Filter actions, then perform func
def prefixMap(logs, prefix, func=lambda x: x):
    return list(map(func, filter(lambda x: x['type'] == prefix, logs)))

# Try to extract the first viable source sentence using some rudimentary heuristics
def firstViableSrc(segment):
    srcs = prefixMap(segment, 'TRANSLATE1', lambda x: x['text1'])
    if len(srcs) == 0:
        return None
    longest = sorted(srcs, key=lambda x: len(x), reverse=True)

    for src in longest:
        if len(src) == 0:
            return None
        lastConfirmSrc = prefixMap(segment, 'CONFIRM', lambda x: x['text1'])[-1]
        if src == lastConfirmSrc:
            continue
        if src[-1] in ".?" or (len(src) > 1 and src[-2] in ".?"):
            return src
    return None

# TODO
def prepareA0(segments, questions):
    out = dict()
    for seg in segments:
        confirm = prefixMap(seg, 'CONFIRM')
        if len(confirm) > 0:
            confirm = confirm[-1]
        else:
            continue
        out.setdefault(confirm['sid'], []).append((str(confirm['usid']), confirm['text1']))
        firstViable = firstViableSrc(seg)
        if firstViable:
            out.setdefault(confirm['sid'], []).append((f'v{confirm["usid"]}', firstViable))

    markdown = ''
    csv = 'USID, Score\n'
    for sid, segments in out.items():
        question = questions[sid].replace('*', '__')
        markdown += f'\n\n\n## {sid}\n'
        helpText = ''
        if sid.startswith('t'):
            helpText += 'Popište daný problém technické podpoře.'
        else:
            helpText += 'Položte dotaz, na který odpovídá vyznačená část v textu.'
        markdown += f'_{helpText}_\n\n'
        markdown += f'{question}\n\n'
        for segment in segments:
            markdown += f'- `{segment[0].rjust(7)}` {segment[1]}\n'
            csv += f'{segment[0].rjust(7)},0\n'
    markdown = markdown.replace('<br>', ' ')
    markdown = markdown.replace('</br>', ' ')
    return markdown, csv

with open(args.blogfile, 'rb') as f:
    segments = pickle.load(f)

with open(args.questions_flat, 'r') as f:
    questions = json.loads(f.read())

markdown, csv = prepareA0(segments, questions)
if args.a0md is not None:
    with open(args.a0md, 'w') as f:
        f.write(markdown)
if args.a0csv is not None:
    with open(args.a0csv, 'w') as f:
        f.write(csv)
