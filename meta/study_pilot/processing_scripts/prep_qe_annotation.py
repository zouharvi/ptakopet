#!/usr/bin/env python3
import argparse
import pickle
import json
from utils import prefixMap, firstViableTrg

# Prepare quality estimation text

parser = argparse.ArgumentParser(description='')
parser.add_argument('blog1file',  help='Path to the binary log (.blog1) file in question')
parser.add_argument('questions_flat',  help='Path to the questions_flat.json file')
parser.add_argument('--a0md', help='Path to the annotation markdown file')
parser.add_argument('--a0csv', help='Path to the annotation csv file')
args = parser.parse_args()

# Prepare the A0 format for quality annotation
# (group by SID, add flavor text)
def prepareA0(segments, questions):
    out = dict()
    for seg in segments:
        confirm = prefixMap(seg, 'CONFIRM')
        if len(confirm) > 0:
            confirm = confirm[-1]
        else:
            continue
        out.setdefault(confirm['sid'], []).append((str(confirm['usid']), confirm['text2']))
        firstViable = firstViableTrg(seg)
        if firstViable:
            out.setdefault(confirm['sid'], []).append((f'v{confirm["usid"]}', firstViable['text2']))

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
            csv += f'"{segment[0].rjust(7)}",0\n'
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
