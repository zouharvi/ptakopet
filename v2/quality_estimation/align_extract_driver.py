#!/bin/python3

import sys
import os
import subprocess
import math

assert(len(sys.argv) == 3)

# read all lines at once
with open(sys.argv[1], mode='r') as file_source:
    file_source_txt = file_source.read().split('\n')[:-1]
with open(sys.argv[2], mode='r') as file_target:
    file_target_txt = file_target.read().split('\n')[:-1]

# input files must have the same length
assert(len(file_source_txt) == len(file_target_txt))

# create tmp folder
os.mkdir('align_extract_tmp')

# fast align requires special file format
file_align_txt = [x + ' ||| ' + y for x, y in zip(file_source_txt, file_target_txt)]

with open('align_extract_tmp/align_in.out', 'w') as file_align:
    file_align.write('\n'.join(file_align_txt))
    file_align.write('\n')

print("Doing fast_align...", end=" ")
fastAlignCommand = "./fast_align/build/fast_align -i align_extract_tmp/align_in.out -d -o -v"
process = subprocess.Popen(fastAlignCommand.split(), stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
output, error = process.communicate()
align_txt = output.decode('utf-8').split('\n')
os.remove('align_extract_tmp/align_in.out')
print("DONE")

# <= 10 for QuEst feature extractor
CHUNK_SIZE = 10

features_raw = ''

for i in range(math.ceil(len(file_source_txt)/CHUNK_SIZE)):
    print("Processing lines: " + str(CHUNK_SIZE*i) + " to " + str(CHUNK_SIZE*(i+1)) + "...", end=' ')
    sys.stdout.flush()

    with open('align_extract_tmp/align.out', 'w') as align_file:
        align_file.write('\n'.join(align_txt[(CHUNK_SIZE*i):(CHUNK_SIZE*(i+1))]))
        align_file.write('\n')

    with open('align_extract_tmp/source.in', 'w') as file_source:
        file_source.write('\n'.join(file_source_txt[(CHUNK_SIZE*i):(CHUNK_SIZE*(i+1))]))
        file_source.write('\n')

    with open('align_extract_tmp/target.in', 'w') as file_target:
        file_target.write('\n'.join(file_target_txt[(CHUNK_SIZE*i):(CHUNK_SIZE*(i+1))]))
        file_target.write('\n')

    os.chdir('quest_extractor')
    questCommand =""" 
        java \
            -cp QuEst++.jar:lib/* shef.mt.WordLevelFeatureExtractor \
            -lang english spanish \
            -input ../align_extract_tmp/source.in ../align_extract_tmp/target.in \
            -alignments ../align_extract_tmp/align.out \
            -config config/en-es.dev.word.properties
        """

    process = subprocess.Popen(questCommand.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = process.communicate()
    # print(output.decode('utf-8'))
    
    with open('output/test/output.txt', 'r') as features_file:
        features_raw += features_file.read()

    os.chdir('../')
    
    os.remove('align_extract_tmp/source.in')
    os.remove('align_extract_tmp/target.in')
    os.remove('align_extract_tmp/align.out')
    print("DONE")

os.rmdir('align_extract_tmp')

with open('features.out', 'w') as file_features:
    file_features.write(features_raw)

exit(0)
