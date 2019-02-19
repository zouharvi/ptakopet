#!/bin/python3 

from align_extract_driver import align_extract
import sys
import os
import subprocess

en_es_config = {
    "file_source": "",
    "lang_source": "",
    "file_target": "",
    "lang_target": ""
}

config = 'en-es.crf.cfg'


if __name__ == "__main__":
    # program, source, target
    assert(len(sys.argv) == 3)

    # create tmp folder
    os.mkdir('.extract_tmp')

    # save input to file
    with open('.extract_tmp/source', 'w') as file_source:
        file_source.write(sys.argv[1])
        file_source.write('\n')
    with open('.extract_tmp/target', 'w') as file_target:
        file_target.write(sys.argv[2])
        file_target.write('\n')

    # extract features for input translations
    align_extract('.extract_tmp/source', '.extract_tmp/target', '.extract_tmp/features.out')
    feature_lines = sum(1 for line in open('.extract_tmp/features.out'))

    # create dummy labels for test (QuEst requirement)
    with open('.extract_tmp/labels_fake.out', 'w') as file_labels:
        for i in range(feature_lines):
            file_labels.write('1\n')


    print("Doing QuEst ML...", end=" ")
    questML = "python2 ./quest_ml/src/learn_model.py ./quest_ml/config/en-es.dev.cfg"
    process = subprocess.Popen(questML.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = process.communicate()
    print(error.decode('utf-8'))
    print("DONE")


    # rm tmp folder
    os.remove('.extract_tmp/features.out')
    os.remove('.extract_tmp/labels_fake.out')
    os.remove('.extract_tmp/source')
    os.remove('.extract_tmp/target')
    os.rmdir('.extract_tmp')