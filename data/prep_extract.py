#!/bin/env python3

import os
import subprocess


def bash(bashCommand=""):
    """
    Creates a new process and returns its result in UTF-8 (synchronously)
    """
    process = subprocess.Popen(
        bashCommand.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = process.communicate()
    return (output.decode('utf-8'), error.decode('utf-8'))


def strip_tags(fileIn, fileOut):
    """
    Remove feature names (output of QuEst++ feature extractor)
    """
    with open(fileIn, 'r') as fileIn:
        features = fileIn.readlines()
    features = [[x.split('=')[1] for x in line.rstrip('\n').rstrip('\t').split('\t')] for line in features]
    with open(fileOut, 'w') as fileOut:
        fileOut.write('\n'.join(['\t'.join(x) for x in features]))


def feature_extract(fileS, fileT, fileA, fileOut):
    """
    Run from qe/questplusplus
    """
    os.makedirs('tmp', exist_ok=True)
    with open(fileS) as fileS:
        sourceLines = fileS.readlines()
    with open(fileT) as fileT:
        targetLines = fileT.readlines()
    with open(fileA) as fileA:
        alignmentLines = fileA.readlines()

    for i in range(len(targetLines)//10+1):
        snapS = sourceLines[10*i:10*(i+1)]
        snapT = targetLines[10*i:10*(i+1)]
        snapA = alignmentLines[10*i:10*(i+1)]
        with open('tmp/snap.en', 'w') as fileS:
            print(''.join(snapS).rstrip('\n'), file=fileS, end='')
        with open('tmp/snap.cs', 'w') as fileT:
            print(''.join(snapT).rstrip('\n'), file=fileT, end='')
        with open('tmp/snap.alignments', 'w') as fileA:
            print(''.join(snapA).rstrip('\n'), file=fileA, end='')
        print(i, '/', len(targetLines)//10, sep='')
        os.chdir('../qe/questplusplus')
        (output, error) = bash("""
                                java -cp QuEst++.jar:lib/* shef.mt.WordLevelFeatureExtractor
                                                -lang english spanish
                                                -input ../../data/tmp/snap.en ../../data/tmp/snap.cs
                                                -alignments ../../data/tmp/snap.alignments
                                                -config ../questplusplus-config/config.word-level.properties
                                """)
        print(output)
        print(error)
        with open('output/test/output.txt', 'r') as fileOutput:
            outLines = fileOutput.readlines()
        os.chdir('../../data')
        with open(fileOut, 'a+') as fileOutObj:
            fileOutObj.write(''.join(outLines))
    os.remove('tmp/snap.en')
    os.remove('tmp/snap.cs')
    os.remove('tmp/snap.alignments')
    os.rmdir('tmp')


def collapse_labels(fileIn, fileOut):
    """
    This function drops informatioun about missing tokens, renames form labels format to numbers and separates everything with newlines.
    > Missing tokens in the machine translations, as indicated by the TER tool are annotated as follows:
    > After each token in the sentence and at sentence start, a gap tag is placed.
    > This tag will be set to 'BAD' if in that position there should be one or more tokens, and OK otherwise.
    > Note that number of tags for each target sentence is 2*N+1, where N is the number of tokens in the sentence. 
    """
    with open(fileIn, 'r') as fileIn:
        labels =  fileIn.readlines()
    
    labels = [x.rstrip('\n').split(' ') for x in labels]
    labels = [[v for i, v in enumerate(lst) if i % 2 == 1] for lst in labels]
    labels = '\n'.join(['\n'.join(x) for x in labels])
    labels = labels.replace('BAD', '0').replace('OK', '1')

    with open(fileOut, 'w') as fileOut:
        fileOut.write(labels)

if __name__ == "__main__":
    collapse_labels('qe/WMT18.en-cs.train.tags', 'qe/WMT18.en-cs.train.tags.collapsed')
    feature_extract('qe/WMT18.en-cs.train.en', 'qe/WMT18.en-cs.train.cs', 'qe/WMT18.en-cs.train.alignments', 'qe/WMT18.en-cs.train.features')
    strip_tags('qe/WMT18.en-cs.train.features', 'qe/WMT18.en-cs.train.features.clean')