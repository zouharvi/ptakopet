#!/bin/python3 

import sys
import os
import subprocess

def align(text_source, text_target):
    try:
        # create tmp folder
        os.makedirs('.align_tmp', exist_ok=True)

        # save input to file
        with open('.align_tmp/source', 'w') as file_source:
            file_source.write(text_source)
            file_source.write('\n')
        with open('.align_tmp/target', 'w') as file_target:
            file_target.write(text_target)
            file_target.write('\n')

        # extract features for input translations
        file_source_name = '.align_tmp/source'
        file_target_name = '.align_tmp/target'

        # read all lines at once
        with open(file_source_name, mode='r') as file_source:
            file_source_txt = file_source.read().split('\n')[:-1]
        with open(file_target_name, mode='r') as file_target:
            file_target_txt = file_target.read().split('\n')[:-1]

        # input files must have the same length
        assert(len(file_source_txt) == len(file_target_txt))

        # fast align requires special file format
        file_align_txt = [x + ' ||| ' + y for x, y in zip(file_source_txt, file_target_txt)]

        with open('.align_tmp/align_in.out', 'w') as file_align:
            file_align.write('\n'.join(file_align_txt))
            file_align.write('\n')

        # start the process through pipe
        print('Running fast_align...', end=' ')
        fastAlignCommand = './fast_align/build/fast_align -i .align_tmp/align_in.out -d -o -v'
        process = subprocess.Popen(fastAlignCommand.split(), stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        output, _ = process.communicate()
        align_txt = output.decode('utf-8').split('\n')[0]
        os.remove('.align_tmp/align_in.out')
        print('OK')
    finally:
        # rm tmp folder
        os.remove('.align_tmp/source')
        os.remove('.align_tmp/target')
        os.rmdir('.align_tmp')

    return align_txt