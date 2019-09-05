#!/bin/env python3
# Script to process SQuAD 2.0 and its corresponding version translated to Czech 
# by Matúš Žilinec 2.1. Parts of the dataset can be either ripped or picked
# at random
# - rip_json
# - rip_random_seq
# - rip_random
#
# - zouharvi Sep 5 2019 

import json
import urllib.parse
import sys
import random

SQUAD_ZILINEC = 'zilinec-train-v2.1.json'
SQUAD_SQUAD   = 'squad-train-v2.0.json'

if len(sys.argv) <= 1 or sys.argv[1] == 'rip_json':
    questionsFile = SQUAD_SQUAD
    targetKeys = ['USB', 'IBM', 'MP3', 'Počítač', 'IPod', 'Kompaktní_disk']

    with open(questionsFile, 'r') as questionsFile:
        questions = questionsFile.read()

    questions = json.loads(questions)['data']
    targetQuest = None

    for obj in questions:
        titleKey = urllib.parse.unquote(obj['title'])
        print(titleKey)
        if titleKey in targetKeys:
            with open(f'squad-{titleKey}.json', 'w') as outFile:
                outFile.write(json.dumps(obj, ensure_ascii=False))

elif len(sys.argv) == 3 and sys.argv[1] == 'rip_random_seq':
    # pick randomly based on number of relevant questions
    outFile = sys.argv[2]
    with open(SQUAD_SQUAD, 'r') as f:
        original = json.loads(f.read())['data']
    with open(SQUAD_ZILINEC, 'r') as f:
        zilinec = json.loads(f.read())['data']
    questionsAll = list(zip(original, zilinec))
   
    from collections import Counter, defaultdict 
    spanMapRevTotal = {} 
    DIDToQID= {}
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
    print(Counter(DIDToQIDCount.values()))
    QIDCountToDID = {}
    for (k,v) in DIDToQIDCount.items():
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

    output = [{'org': formatParagraph(parOrg, sID, lID), 'zil': parZil} for (parOrg, sID, lID, parZil) in output]
    print(len(output))
    # Counter({1: 81619, 2: 2303, 3: 166, 4: 13, 5: 8, 6: 1})
    with open(outFile, 'w') as f:
        f.write(json.dumps(output, ensure_ascii=False))

elif len(sys.argv) == 3 and sys.argv[1] == 'rip_random':
    # choose totally at random 
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
        # choose topic
        (topicOrg, topicZil) = random.choice(questionsAll)
        titleOrg = topicOrg['title']
        titleZil = topicZil['title']
        
        # choose paragraph 
        parsAll = list(zip(topicOrg['paragraphs'], topicZil['paragraphs']))
        (parOrg, parZil)= random.choice(parsAll)
        textOrg = parOrg['context']
        textZil = parZil['context']
        
        # choose question 
        qasAll = list(zip(parOrg['qas'], parZil['qas']))
        (qaOrg, qaZil)= random.choice(qasAll)
        
        qaTextOrg = qaOrg['question']
        qaTextZil = qaZil['question']
        
        anssOrg = qaOrg['answers']
        anssZil = qaZil['answers']
        
        print(f'{titleOrg}/{titleZil}')
        noAnssOrg = len(anssOrg)
        noAnssZil = len(anssZil)
        # assert(noAnssOrg == noAnssZil)
        # anssCounts.append(noAnssOrg)
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
    
else:
    print("Wrong arguments, see code")
