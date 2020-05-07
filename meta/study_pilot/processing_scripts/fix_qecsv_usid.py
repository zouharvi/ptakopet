#!/usr/bin/env python3
import argparse
import pickle
import copy

# The USID (unique user segment identifiers) were computed badly. Unfortunately quality annotation
# materials were exported with bad USIDs and changing them ex post was not possible. The bad USIDs
# were in fact ULID (unique user line identifiers). What's more, the first viables didn't have the
# proper ULIDs, but ULIDs from final responses.
# To fix this, the fixUSIDsMap is constructed, which simulates the bad USIDs and maps them to correct
# USIDs. 
# Another issue was that first viables were estimated by the translation length and not source length
# (firstViableSrc vs firstViableTrg), so the blog file now contains both first_viable_src and
# first_viable_trg.
# The stable blog file is stored in merged_a0.blog

parser = argparse.ArgumentParser(description='')
parser.add_argument('blog',  help='Path to the binary log (.blog) file')
parser.add_argument('a0csv',  help='Path to the a0.csv file')
parser.add_argument('a0csvf',  help='Path to the fixed a0.csv file')
args = parser.parse_args()

# USIDs were off at first
# this function returns a map from the wrong USIDs to proper ones 
def fixUSIDsMap(segments):
    i = 0
    j = 0
    out = dict()
    for seg in segments:
        for _line in seg['items']:
            j += 1
            out[j] = i
        i += 1
    return out

# This checks, that the fix works on randomly selected lines
def isFixed(segments, ratingsOld, ratingsNew):
    brokenUSIDexample = [
        ('', '20071', 'In welchem Magazin erschien sie?'),
        ('', '24913', 'Wie kann man Zahlungen leisten?'),
        ('v', '3204', 'Wie kann die Gebühr entschädigt werden?'),
        ('v', '24993', 'Welche Daten können über die Benutzer von Websites gesammelt werden?'),
        ('v', '27889', 'Was für ein Lied hat DeWyze gewählt?'),
    ]
    for bUSID in brokenUSIDexample:
        oldUSID = bUSID[0] + bUSID[1]
        print(f'Taking a look at: {oldUSID} (old), "{bUSID[2]}"')
        # find index in old ratings
        for i in range(len(ratingsOld)):
            if ratingsOld[i][0] == oldUSID:
                oldRating = ratingsOld[i]
                oldRatingI = i

        # access the new rating
        newRating = ratingsNew[oldRatingI]

        # check the ratings correspond
        if newRating[1] != oldRating[1]:
            return False
        print(f'New USID appears to be {newRating[0]}')

        # check that the new USID corresponds to the value stored in new segments
        ok = False
        newUSID = int(newRating[0].lstrip('v'))
        for seg in segments:
            if seg['usid'] == newUSID:
                if bUSID[0] == 'v':
                    print(f'Corresponding segment {newUSID} has "{seg["first_viable_trg"]["text2"]}"')
                    if bUSID[2] != seg['first_viable_trg']['text2']:
                        return False
                    ok = True
                else:
                    print(f'Corresponding segment {newUSID} has "{seg["final"]["text2"]}"')
                    if bUSID[2] != seg['final']['text2']:
                        return False
                    ok = True
        print()
        # Check that it found a segment
        if not ok:
            return False
    return True

with open(args.blog, 'rb') as f:
    segments = pickle.load(f)

with open(args.a0csv, 'r') as f:
    a0csv = [x.rstrip('\n').split(',') for x in f.readlines()[1:]]
    a0csv = [[x[0].rstrip('"').lstrip('"').lstrip(" "), int(x[1])] for x in a0csv]
a0csvf = copy.deepcopy(a0csv)

USIDmap = fixUSIDsMap(segments)
try:
    for x in a0csvf:
        if x[0][0] == 'v':
            x[0] = f'v{USIDmap[int(x[0][1:])]}'
        else:
            x[0] = f'{USIDmap[int(x[0])]}'
except Exception as e:
    print('Unable to construct appropriate mapping. It appears, that the CSV file is already fixed.')
    exit(0)

try:
    assert(isFixed(segments, a0csv, a0csvf))
except Exception as e:
    print('The mapping didn\'t solve the problem. Refusing to save.')
    exit(0)

print('All went ok, saving.')

with open(args.a0csvf, 'w') as f:
    f.write('"USID","Score"\n')
    for x in a0csvf:
        f.write(f'"{x[0]}",{x[1]}\n')