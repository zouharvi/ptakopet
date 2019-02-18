#!/bin/python3

import sys
import os
import subprocess

assert(len(sys.argv) == 3)

file_source = open(sys.argv[1], mode='r')
file_target = open(sys.argv[2], mode='r')
 
# read all lines at once
file_source_txt = file_source.read().split('\n')[:-1]
file_target_txt = file_target.read().split('\n')[:-1]

# close input files
file_source.close()
file_target.close()

# input files must have the same length
assert(len(file_source_txt) == len(file_target_txt))

# fast align requires special file format
file_align_txt = [x + ' ||| ' + y for x, y in zip(file_target_txt, file_source_txt)]

with open('fast_align/tmp.out', 'w') as file_align:
    file_align.write('\n'.join(file_align_txt))
    file_align.write('\n')

print("Doing fast_align...", end=" ")
bashCommand = "./fast_align/build/fast_align -i fast_align/tmp.out -d -o -v"
process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
output, error = process.communicate()
output = output.decode('utf-8')
os.remove('fast_align/tmp.out')
print("DONE")

for i in range(int(len(file_source_txt)/10)):
    print("Processing lines: " + str(10*i) + " to " + str(10*i+10) + "...", end=' ')
    print("DONE")


# with open('fast_align/tmp.out', 'w') as file_align:
#     file_align.write(output.decode("utf-8"))


exit(0)




print(bashCommand)

# paste  $1 $2 -d '|' | sed 's/|/ ||| /' > tmp.align
# ./build/fast_align -i tmp.align -d -o -v > out.align
# rm -f tmp.align
