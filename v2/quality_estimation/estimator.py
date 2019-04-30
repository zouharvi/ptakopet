#!/bin/python3 

import extract_driver
import sys, os, subprocess

en_es_config = {
    'file_source': '',
    'lang_source': '',
    'file_target': '',
    'lang_target': ''
}

config = 'en-es.crf.cfg'

def run_questpp(text_source, text_target):
    response = []

    try:
        # create tmp folder
        os.makedirs('.extract_tmp', exist_ok=True)

        # extract features for input translations
        extract_driver.extract([text_source], [text_target], '.extract_tmp/features.out')
        feature_lines = sum(1 for line in open('.extract_tmp/features.out'))

        # create dummy labels for test (QuEst requirement)
        with open('.extract_tmp/labels_fake.out', 'w') as file_labels:
            for i in range(feature_lines):
                file_labels.write('1\n')

        print('Running QuEst ML...', end=' ')
        questML = 'python2.7 ./quest_ml/src/learn_model.py ./quest_ml/config/en-es.dev.cfg'
        process = subprocess.Popen(questML.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        process.communicate()
        # output, error = process.communicate() # .decode('utf-8')
        print('OK')

        with open('predicted.csv', 'r') as file_result:
            responseText = file_result.read()
            for x in responseText.split('\n'):
                if(len(x) != 0):
                    response.append(float(x))
            # print(responseText.split('\n'))
    finally:
        os.remove('.extract_tmp/features.out')
        os.remove('.extract_tmp/labels_fake.out')
        os.rmdir('.extract_tmp')
        os.remove('predicted.csv')

    return response

if __name__ == '__main__':
    # program, source, target
    assert(len(sys.argv) == 3)
    run_questpp(sys.argv[1], sys.argv[2])
