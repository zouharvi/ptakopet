import os, re
from utils import DirCrawler, bash

def hunalign(sourceText, targetText):
    """
    Performs sentence alignment on sourceText to targetText using Hunalign.
    It's ok to raise Exceptions here. They are handled upstream.
    """
    sourceText = re.sub('\n', ' ', sourceText)
    sourceText = re.sub('\.', '.\n', sourceText)
    sourceText = re.sub('\?', '.\n', sourceText)
    targetText = re.sub('\n', ' ', targetText)
    targetText = re.sub('\.', '.\n', targetText)
    targetText = re.sub('\?', '?\n', targetText)

    sourceText = sourceText.split('\n')
    targetText = targetText.split('\n')

    sourceText = list(filter(lambda x: not re.match('.?.?(\.|\?)', x), sourceText))
    targetText = list(filter(lambda x: not re.match('.?.?(\.|\?)', x), targetText))

    with DirCrawler('align/hunalign'):
        with open('tmp.src', 'w') as f:
            f.write('\n'.join(sourceText) + '\n')
        with open('tmp.trg', 'w') as f:
            f.write('\n'.join(targetText) + '\n')
        (output, _error) = bash("perl hunalignwrapper.pl --hunalign=./hunalign/src/hunalign/hunalign tmp.src tmp.trg")
        os.remove('tmp.src')
        os.remove('tmp.trg')
    
    output = list(filter(lambda x: x.strip() != '', output.split('\n')))
    align = [[int(y) for y in x.split('\t')[0].split('-')] for x in output]

    # Process the ladder output of Hunalign
    output = []
    for l, r in align:
        left = []
        right = []
        while True:
            if l == 0 and r == 0:
                output.append([' '.join(left), ' '.join(right)])
                break
            elif l > r:
                left.append(sourceText.pop(0))
                l -= 1
                continue
            elif l < r:
                right.append(targetText.pop(0))
                r -= 1
                continue
            else:    
                left.append(sourceText.pop(0))
                right.append(targetText.pop(0))
                l -= 1
                r -= 1
    return output
