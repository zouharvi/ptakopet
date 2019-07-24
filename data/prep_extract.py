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
    with open(fileIn, 'r') as fileIn:
        features = fileIn.readlines()
    features = [[x.split('=')[1] for x in line.rstrip('\n').rstrip('\t').split('\t')] for line in features]
    with open(fileOut, 'w') as fileOut:
        fileOut.write('\n'.join(['\t'.join(x) for x in features]))


def feature_extract(fileS, fileT, fileA):
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
        with open('outputAll.features', 'a+') as fileOutput:
            fileOutput.write(''.join(outLines))
    os.remove('tmp/snap.en')
    os.remove('tmp/snap.cs')
    os.remove('tmp/snap.alignments')
    os.rmdir('tmp')


def collapse_labels(fileIn, fileOut):
    with open(fileIn, 'r') as fileIn:
        labels =  fileIn.readlines()
    
    labels = [x.rstrip('\n').split(' ') for x in labels]
    labels = [[v for i, v in enumerate(lst) if i % 2 == 1] for lst in labels]
    labels = '\n'.join(['\n'.join(x) for x in labels])
    labels = labels.replace('BAD', '0').replace('OK', '1')

    with open(fileOut, 'w') as fileOut:
        fileOut.write(labels)

if __name__ == "__main__":
    feature_extract('qe/WMT18.en-cs.train.en', 'qe/WMT18.en-cs.train.cs', 'qe/WMT18.en-cs.train.alignments')
    # feature_extract('qe2/dev.src', 'qe2/dev.mt', 'qe2/dev.src-mt.alignments')
    strip_tags('outputAll.features', 'outputAll.clean')
    # collapse_labels('qe2/dev.tags', 'qe2/dev.tags.collapsed')