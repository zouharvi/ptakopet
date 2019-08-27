#!/usr/bin/env python3

from argparse import ArgumentParser
import requests
import sys

def process_file(in_file, out_file):
    with open(in_file, 'r') as in_file:
        lines = in_file.readlines()
    translated = []
    for index, line in enumerate(lines):
        r = requests.post('https://lindat.mff.cuni.cz/services/transformer/api/v2/models/en-cs?tgt=cs&src=en', data={'input_text': line})
        if r.status_code == 200:
            transl = "  ".join([sent.strip() for sent in r.json()])
            translated.append(transl)
            print(f'OK: {index+1}/{len(lines)}')
        else:
            print(f'ERROR: return code: {r.status_code}')
            translated.append(f'ERROR: {r.status_code}')

        if index % 100 == 0 or index == len(lines)-1:
            # save partial work every 100 requests and at the end
            print(f'SAVING: {index+1}/{len(lines)}')
            with open(out_file, 'w', encoding='UTF-8') as out_file_obj:
                out_file_obj.write('\n'.join(translated))


if __name__ == '__main__':
    ap = ArgumentParser()
    ap.add_argument('in_file', type=str, help='File to translate')
    ap.add_argument('out_file', type=str, help='Translated output')
    args = ap.parse_args()

    process_file(args.in_file, args.out_file)

