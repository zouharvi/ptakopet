#!/bin/python3

import sys, os, subprocess
import math
import re
import align_driver

# remove feature names from feature extractor output
def remove_names(line):
    return re.sub('[A-Z0-9]*=', '', line)

# input list of source and target transslations
def extract(text_source, text_target, features_filename='features.out'):
    os.mkdir('.align_extract_tmp')
    align_txt = [align_driver.align(text_source[0], text_target[0])]
    
    # <= 10 for QuEst feature extractor
    CHUNK_SIZE = 10
    features_raw = ''
    for i in range(math.ceil(len(text_source)/CHUNK_SIZE)):
        print("Extractor processing lines: " + str(CHUNK_SIZE*i) + " to " + str(CHUNK_SIZE*(i+1)) + "...", end=' ')
        sys.stdout.flush()

        with open('.align_extract_tmp/align.out', 'w') as align_file:
            align_file.write('\n'.join(align_txt[(CHUNK_SIZE*i):(CHUNK_SIZE*(i+1))]))
            align_file.write('\n')

        with open('.align_extract_tmp/source.in', 'w') as file_source:
            file_source.write('\n'.join(text_source[(CHUNK_SIZE*i):(CHUNK_SIZE*(i+1))]))
            file_source.write('\n')

        with open('.align_extract_tmp/target.in', 'w') as file_target:
            file_target.write('\n'.join(text_target[(CHUNK_SIZE*i):(CHUNK_SIZE*(i+1))]))
            file_target.write('\n')

        os.chdir('quest_extractor')
        questCommand =""" 
            java \
                -cp QuEst++.jar:lib/* shef.mt.WordLevelFeatureExtractor \
                -lang english spanish \
                -input ../.align_extract_tmp/source.in ../.align_extract_tmp/target.in \
                -alignments ../.align_extract_tmp/align.out \
                -config config/en-es.word.properties
            """

        process = subprocess.Popen(questCommand.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        # output, error = process.communicate() # .decode('utf-8')
        process.communicate()
        
        with open('output/test/output.txt', 'r') as features_file:
            features_raw += features_file.read()

        os.chdir('../')
        os.remove('.align_extract_tmp/source.in')
        os.remove('.align_extract_tmp/target.in')
        os.remove('.align_extract_tmp/align.out')
        print('OK')

    os.rmdir('.align_extract_tmp')

    with open(features_filename, 'w') as file_features:
        file_features.write(remove_names(features_raw))

if __name__ == "__main__":
    assert(len(sys.argv) == 3)
    extract(sys.argv[1], sys.argv[2])