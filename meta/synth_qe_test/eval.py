#! /bin/env python3
from itertools import takewhile
from statistics import mean

# This script compares confusion matricies for two annotators of QE data

file1 = 'train.head50.tags.gold'
file2 = 'train.head50.tags'

def parseData(lines):
    lines = [line for line in lines]
    
    lines = [list(takewhile(lambda x: x != '#', line)) for line in lines] 
    lines = [list(filter(lambda x: x != ' ' and x != '\n', line)) for line in lines]
    lines = [list(map(lambda x: x == '1', line)) for line in lines]
    return lines

with open(file1, 'r') as file1: 
    data1 = parseData(file1.readlines())
with open(file2, 'r') as file2: 
    data2 = parseData(file2.readlines())

# assert same lengths
assert(sum([abs(len(x)-len(y)) for x,y in zip(data1, data2)]) == 0)

# we treat file1 as gold data
def confusion_matrix(data1, data2):
    flat1 = [item for sublist in data1 for item in sublist]
    flat2 = [item for sublist in data2 for item in sublist]
    return (
        mean(x == 1 and y == 1 for x, y in zip(flat1, flat2)),
        mean(x == 1 and y == 0 for x, y in zip(flat1, flat2)),
        mean(x == 0 and y == 0 for x, y in zip(flat1, flat2)),
        mean(x == 0 and y == 1 for x, y in zip(flat1, flat2))
    )

TP, FP, TN, FN = confusion_matrix(data1, data2)
print('Total:')
print(f'TP={TP*100:.2f}%, FP={FP*100:.2f}%\nFN={FN*100:.2f}%, TN={TN*100:.2f}%')

TP, FP, TN, FN = confusion_matrix(data1[:30], data2[:30])
print('cs-de:')
print(f'TP={TP*100:.2f}%, FP={FP*100:.2f}%\nFN={FN*100:.2f}%, TN={TN*100:.2f}%')

TP, FP, TN, FN = confusion_matrix(data1[30:], data2[30:])
print('en-de:')
print(f'TP={TP*100:.2f}%, FP={FP*100:.2f}%\nFN={FN*100:.2f}%, TN={TN*100:.2f}%')
