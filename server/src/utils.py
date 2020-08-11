import os
import subprocess
import re
import mosestokenizer

class DirCrawler():
    """
    Allows child classes to change to their respective folders and then roll back.
    Use crawlIn multiple times, but finally call crawlOut 
    """

    def __init__(self, basePath=''):
        self.basePath = basePath

    def __enter__(self, path=''):
        self.prevPath = os.getcwd()
        os.chdir(self.basePath)

    def __exit__(self, type, value, traceback):
        os.chdir(self.prevPath)


def bash(bashCommand=""):
    """
    Creates a new process and returns its result in UTF-8 (synchronously)
    """
    process = subprocess.Popen(
        bashCommand.split(),
        stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = process.communicate()
    return (output.decode('utf-8'), error.decode('utf-8'))


def formatParallel(fileSource, fileTarget):
    """
    Takes two files and returns a joined list of lines separated by |||
    """
    with open(fileSource, 'r') as fileSource:
        with open(fileTarget, 'r') as fileTarget:
            lines1 = [x.rstrip('\n') for x in fileSource.readlines()]
            lines2 = [x.rstrip('\n') for x in fileTarget.readlines()]
            out = ["{} ||| {}".format(x, y) for (x, y) in zip(lines1, lines2)]
            return out


def formatParallelFile(fileSource, fileTarget, fileOut):
    """
    Takes the output of formatParallel and stores it into a file
    """
    with open(fileOut, 'w') as fileOut:
        out = formatParallel(fileSource, fileTarget)
        print('\n'.join(out), file=fileOut)

def multiReplace(text, replacement):
    """
    Apply each tuple (patter, replace) in input replacement array to input text
    """
    if not replacement:
        return text
    else:
        return multiReplace(re.sub(replacement[0][0], replacement[0][1], text), replacement[1:])

tokenizers = {}

def tokenize(text, language, join=True):
    """
    Tokenize text with mosestokenizer 
    """
    if not language in tokenizers:
        tokenizers[language] = mosestokenizer.MosesTokenizer(language)
    tokenizer = tokenizers[language]
    tokens = tokenizer(text)
    # tokenize.close()
    if join:
        tokens = ' '.join(tokens)
    return tokens
