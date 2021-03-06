#!/bin/env python3

# Script to process SQuAD 2.0 and its corresponding version translated to Czech
# by Matúš Žilinec. Parts of the dataset can be either ripped or picked at random.
# This script is used to explore and extract random paragraphs from the SQuAD dataset.
# - explore_hardcoded
# - rip_random_seq
# - rip_random
# - add_keys

import json
import urllib.parse
import sys
import random
from collections import Counter, defaultdict

SQUAD_ZILINEC = 'zilinec-train-v2.1.json'
SQUAD_SQUAD = 'squad-train-v2.0.json'

if len(sys.argv) <= 1 or sys.argv[1] == 'explore_hardcoded':
    """
    Dump hardcoded paragraphs of SQuAD to separate files
    (used for exploration)
    """
    targetKeys = ['USB', 'IBM', 'MP3', 'Počítač', 'IPod', 'Kompaktní_disk']
    with open(SQUAD_SQUAD, 'r') as questionsFile:
        questions = json.loads(questionsFile.read())['data']

    # Iterate all paragraphs from SQuAD
    for obj in questions:
        # Check whether the title key is relevant or not
        titleKey = urllib.parse.unquote(obj['title'])
        print(titleKey)
        if titleKey in targetKeys:
            with open(f'squad-{titleKey}.json', 'w') as outFile:
                outFile.write(json.dumps(obj, ensure_ascii=False))

elif len(sys.argv) == 3 and sys.argv[1] == 'extract_distribution':
    """
    Choose paragraphs until each bucket (based on the number of questions) is full.
    ./data_prep.py extract_distribution out.json
    """
    outFile = sys.argv[2]
    with open(SQUAD_SQUAD, 'r') as f:
        original = json.loads(f.read())['data']
    with open(SQUAD_ZILINEC, 'r') as f:
        zilinec = json.loads(f.read())['data']
    questionsAll = list(zip(original, zilinec))

    DIDToQID = {}
    outputSatisf = ([1]*15) + ([2]*15) + ([3]*15) + ([4]*10) + ([5]*5)

    for (topicI, (topicOrg, topicZil)) in enumerate(questionsAll):
        parsAll = list(zip(topicOrg['paragraphs'], topicZil['paragraphs']))
        parSpans = Counter([])
        for (parI, (parOrg, parZil)) in enumerate(parsAll):
            SIDToQID = {}
            qasAll = list(zip(parOrg['qas'], parZil['qas']))
            for (qaOrg, qaZil) in qasAll:
                if (len(qaOrg['answers']) > 0):
                    answer = qaOrg['answers'][0]
                    SIDToQID.setdefault(
                        (answer['answer_start'], len(answer['text'])), []) \
                        .append(qaOrg['id'])

            for ((offset, length), questions) in SIDToQID.items():
                DIDToQID[(topicI, parI, offset, length)] = questions

    DIDToQIDCount = {k: len(v) for k, v in DIDToQID.items()}

    alphaCounterSQUAD = Counter(DIDToQIDCount.values())
    print(f'SQuAD 2.0 per span question distribution: {dict(alphaCounterSQUAD)}')

    QIDCountToDID = {}
    for (k, v) in DIDToQIDCount.items():
        QIDCountToDID.setdefault(v, []).append(k)

    def getByDID(tID, pID, sID, lID):
        topicOrg, topicZil = questionsAll[tID]
        parOrg = topicOrg['paragraphs'][pID]['context']
        parZil = topicZil['paragraphs'][pID]['context']
        return (parOrg, sID, lID, parZil)

    output = []
    for target in outputSatisf:
        dID = random.choice(QIDCountToDID[target])
        output.append(getByDID(*dID))

    def formatParagraph(parOrg, sID, lID):
        return parOrg[:sID] + '*' + parOrg[sID:(sID+lID)] + '*' + parOrg[sID+lID:]

    # We are able to format only the original, since the alignment for the Czech version is off.
    output = [{'org': formatParagraph(parOrg, sID, lID), 'zil': parZil} for (
        parOrg, sID, lID, parZil) in output]
    print(f'Total selected spans: {len(output)}')
    print(f'Total SQuAD 2.0 spans: {sum(alphaCounterSQUAD.values())}')
    # Bucket sizes:
    # Counter({1: 81619, 2: 2303, 3: 166, 4: 13, 5: 8, 6: 1})
    with open(outFile, 'w') as f:
        f.write(json.dumps(output, ensure_ascii=False))

elif len(sys.argv) == 3 and sys.argv[1] == 'extract_random':
    """
    Choose given number of paragraphs totally at random 
    ./data_prep.py extract_random out.json
    """
    NO_QUESTIONS = 60
    outFile = sys.argv[2]
    with open(SQUAD_SQUAD, 'r') as f:
        original = json.loads(f.read())['data']
    with open(SQUAD_ZILINEC, 'r') as f:
        zilinec = json.loads(f.read())['data']
    questionsAll = list(zip(original, zilinec))

    outputQuestions = []
    okCounter = 0
    while okCounter < NO_QUESTIONS:
        # Choose topic (aligned)
        (topicOrg, topicZil) = random.choice(questionsAll)
        titleOrg = topicOrg['title']
        titleZil = topicZil['title']

        # Choose paragraph (aligned)
        parsAll = list(zip(topicOrg['paragraphs'], topicZil['paragraphs']))
        (parOrg, parZil) = random.choice(parsAll)
        textOrg = parOrg['context']
        textZil = parZil['context']

        # Choose question (aligned)
        qasAll = list(zip(parOrg['qas'], parZil['qas']))
        (qaOrg, qaZil) = random.choice(qasAll)

        qaTextOrg = qaOrg['question']
        qaTextZil = qaZil['question']

        anssOrg = qaOrg['answers']
        anssZil = qaZil['answers']

        print(f'{titleOrg}/{titleZil}')
        noAnssOrg = len(anssOrg)
        noAnssZil = len(anssZil)

        if noAnssOrg > 0:
            okCounter += 1
        else:
            continue

        outputQuestions.append({
            'titleOrg': titleOrg,
            'titleZil': titleZil,
            'textOrg': textOrg,
            'textZil': textZil,
            'qaTextOrg': qaTextOrg,
            'qaTextZil': qaTextZil,
        })
elif len(sys.argv) == 4 and sys.argv[1] == 'add_keys':
    """
    Adds stable keys to all questions. This normalization is necessary for presentation purposes.
    ./data_prep.py add_keys out.json tagged.json
    """
    with open(sys.argv[2], 'r') as f:
        questions = json.loads(f.read())
    obj = {}
    for i, q in enumerate(questions['tech_issues']):
        obj[f't{i:02d}'] = q
    for i, q in enumerate(questions['praha_6']):
        obj[f'p{i:02d}'] = q
    for i, q in enumerate(questions['squad']):
        obj[f's{i:02d}'] = q['org']
        obj[f'z{i:02d}'] = q['zil']
    with open(sys.argv[3], 'w') as f:
        f.write(json.dumps(obj, ensure_ascii=False))
else:
    print("Wrong arguments, see code comments")