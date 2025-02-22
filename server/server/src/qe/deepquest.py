from align import hunalign
import os
from utils import DirCrawler, bash, multiReplace, tokenize

import sys
sys.path.append("..")  # Adds higher directory to python modules path.
import shutil

class DeepQuest():
    """
    deepQuest driver
    """
    pairsEpochs = {
        'en_de': 16,
        'cs_de': 42,
    }

    def qe(self, sourceLang, targetLang, sourceText, targetText):
        """
        Performs translation quality estimation on sourceText to targetText using deepQuest
        It's ok to raise Exceptions here. They are handled upstream.
        """

        task_name = f'{sourceLang}_{targetLang}'
        if not task_name in self.pairsEpochs.keys():
            raise Exception(f'{sourceLang}-{targetLang} language pair not supported')
        #if not os.path.isdir(f'data/{task_name}'):
        if not os.path.isdir(f'qe/deepQuest-config/saved_models/{task_name}'):
            raise Exception(f'data/{task_name} does not exits')

        os.makedirs('data/tmp', exist_ok=True)
        
        aligned = hunalign(sourceText, targetText)

        repeatText = lambda text, times=100: '\n'.join([text]*times)
        
        # Sanitize input
        sourceText = [tokenize(x[0], sourceLang, False) for x in aligned]
        targetText = [tokenize(x[1], sourceLang, False) for x in aligned]
        sourceTextPlain = '\n'.join([' '.join(x) for x in sourceText])
        targetTextPlain = '\n'.join([' '.join(x) for x in targetText])

        fileSource = 'qe/deepQuest-config/data_input/test.src'
        with open(fileSource, 'w') as f:
            f.write(repeatText(sourceTextPlain) + '\n')

        fileTarget = 'qe/deepQuest-config/data_input/test.trg'
        with open(fileTarget, 'w') as f:
            f.write(repeatText(targetTextPlain) + '\n')

        tokensTarget = [item for sublist in targetText for item in sublist]
        
        best_epoch = self.pairsEpochs[task_name]
        store_path = f'../../deepQuest-config/saved_models/{task_name}'
        filename = lambda threshold: f'{store_path}/val_epoch_{best_epoch}_threshold_0.{threshold}_output_0.pred'

        with DirCrawler('qe/deepQuest/quest'):
            (_output, _error) = bash(f"""
                bash ../../deepQuest-config/estimate-wordQEbRNN.sh {task_name} {best_epoch}
                 """)
            #print(_output)
            #print(_error)

            features = []
            for i in range(10):
                outputFile = filename(i)
                if not os.path.isfile(outputFile):
                    raise Exception('Server Processing Error')
                with open(outputFile, 'r') as outputFile:
                    features.append([1*(x == 'OK\n') for x in outputFile.readlines()])
            
            # Transpose
            features = [[features[j][i] for j in range(len(features))] for i in range(len(features[0]))]
            # Average lines
            features = [sum(x)/len(x) for x in features]
            # Take only relevant number of tokens
            features = features[:len(tokensTarget)]

            os.remove('log-keras.txt')
            os.remove('log-keras-error.txt')
            shutil.rmtree('datasets')
            to_remove = \
                ['val.qe_metrics', f'val_epoch_{best_epoch}_output_0.pred'] + \
                [f'val_epoch_{best_epoch}_threshold_0.{str(x)}_output_0.pred' for x in range(10)]
            [os.remove(f'{store_path}/'+x) for x in to_remove]

        os.remove(fileSource)
        os.remove(fileTarget)

        return {'status': 'OK', 'qe': features}
