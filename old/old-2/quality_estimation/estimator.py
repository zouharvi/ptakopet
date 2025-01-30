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
                    response.append(max(min(float(x), 0.95), 0))
            # print(responseText.split('\n'))
    finally:
        os.remove('.extract_tmp/features.out')
        os.remove('.extract_tmp/labels_fake.out')
        os.remove('predicted.csv')
        os.rmdir('.extract_tmp')

    return response


def run_deepQuest(text_source, text_target):
    response = []

    try:
        # create tmp folder
        os.makedirs('.qe_tmp', exist_ok=True)
        text_source = text_source.replace(',', '').replace('.', '')
        text_target = text_target.replace(',', '').replace('.', '')
        tokens_source = text_source.split(' ')
        tokens_target = text_target.split(' ')
        with open('deepQuest/quest/examples/word_en_de/test.src', 'w') as f:
            for i in range(51):
                print(text_source, file=f)
        with open('deepQuest/quest/examples/word_en_de/test.mt', 'w') as f:
            for i in range(51):
                print(text_target, file=f)
        
        print('Running deepQuest...', end=' ')
        os.chdir('deepQuest/quest')
        questML = 'bash ./predict-wordQEbRNN.sh --task word_en_de --source src --target mt --score hter --activation sigmoid --device cpu'
        process = subprocess.Popen(questML.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        process.communicate()
        os.chdir('../../')
        # output, error = process.communicate() # .decode('utf-8')
        with open('deepQuest/quest/trained_models/word_en_de_srcmt_EncWord/test_epoch_10_threshold_0.3_output_0.pred', 'r') as f:
            preds = [x.replace('\n', '') for x in f.readlines()[:len(tokens_target)]]
            for p in preds:
                if p == 'OK':
                    response.append(1)
                else:
                    response.append(0.1)
        # print(response)
        print('OK')
        
    finally:
        # os.remove('.qe_tmp/test.src')
        # os.remove('.qe_tmp/test.mt')
        os.rmdir('.qe_tmp')

    return response

if __name__ == '__main__':
    # program, source, target
    assert(len(sys.argv) == 3)
    run_deepQuest(sys.argv[1], sys.argv[2])
