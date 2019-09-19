from align import fast_align, hunalign
import os
from utils import DirCrawler, bash, multiReplace, tokenize

import sys
sys.path.append("..")  # Adds higher directory to python modules path.
import shutil

class OpenKiwi():
    """
    OpenKiwi driver
    """

    def qe(self, sourceLang, targetLang, sourceText, targetText):
        """
        Performs translation quality estimation on sourceText to targetText using OpenKiwi
        It's ok to raise Exceptions here. They are handled upstream.
        """
        
        if not [sourceLang, targetLang] in [['cs','de'], ['en', 'de']]:
            raise Exception(f'{sourceLang}-{targetLang} language pair not supported')

        # Sanitize input
        aligned = hunalign(sourceText, targetText)
        sourceText = [tokenize(x[0], sourceLang, False) for x in aligned]
        targetText = [tokenize(x[1], sourceLang, False) for x in aligned]
        sourceTextPlain = '\n'.join([' '.join(x) for x in sourceText])
        targetTextPlain = '\n'.join([' '.join(x) for x in targetText])

        with DirCrawler('qe/openkiwi-config'):
            fileSource = 'data/input.src'
            with open(fileSource, 'w') as fileSourceW:
                fileSourceW.write(sourceTextPlain)

            fileTarget = 'data/input.trg'
            with open(fileTarget, 'w') as fileTargetW:
                fileTargetW.write(targetTextplain)

            (_output, _error) = bash(f"""
                kiwi predict --config experiments/predict_estimator_{sourceLang}_{targetLang}.yaml
                 """)
            #print(_output)
            #print(_error)
        
            fileOut = 'data/tags'
            with open(fileOut, 'r') as f:
                out = [1-float(x.rstrip('\n')) for x in ' '.join(f.readlines()).split(' ')]
        return {'status': 'OK', 'qe': out}
