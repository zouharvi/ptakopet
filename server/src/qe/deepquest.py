from align import fast_align
import os
from utils import DirCrawler, bash, multiReplace

import sys
sys.path.append("..")  # Adds higher directory to python modules path.
import shutil

class DeepQuest():
    """
    deepQuest driver
    """
    supportedPairs = [['en', 'de']]

    def qe(self, sourceLang, targetLang, sourceText, targetText):
        """
        Performs translation quality estimation on sourceText to targetText using deepQuest
        It's ok to raise Exceptions here. They are handled upstream.
        """
        os.makedirs('data/tmp', exist_ok=True)

        if not [sourceLang, targetLang] in self.supportedPairs:
            raise Exception(
                "{}-{} language pair not supported".format(sourceLang, targetLang))

        repeatText = lambda text, times=100: '\n'.join([text]*times)

        # @TODO: documentation
        # Ignore newlines for now, since they require matching number of source & target sentences
        sourceText = multiReplace(sourceText, [('\n', ' '), (r'([\?\.,])', ' \1 ')])
        targetText = multiReplace(targetText, [('\n', ' '), (r'([\?\.,])', ' \1 ')])

        fileSource = 'qe/deepQuest-config/data_input/test.src'
        with open(fileSource, 'w') as fileSourceW:
            fileSourceW.write(repeatText(sourceText) + '\n')

        fileTarget = 'qe/deepQuest-config/data_input/test.mt'
        with open(fileTarget, 'w') as fileTargetW:
            fileTargetW.write(repeatText(targetText) + '\n')

        tokensTarget = targetText.split(' ')

        best_epoch = 7
        store_path = lambda task_name: f'../../deepQuest-config/saved_models/{task_name}'
        store_path = store_path('en_de')
        filename = lambda threshold: f'{store_path}/val_epoch_{best_epoch}_threshold_0.{threshold}_output_0.pred'

        with DirCrawler('qe/deepQuest/quest'):
            (_output, _error) = bash(f"""
                bash ../../deepQuest-config/estimate-wordQEbRNN.sh {best_epoch}
                 """)

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
            # Take only relevant number of tokens (TODO: verify this)
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
