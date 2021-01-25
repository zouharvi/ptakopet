import pickle
import argparse
import numpy as np
import numpy.ma as ma
from load import Segment, CID
import krippendorff
from pprint import pprint
import sys

def print_masked_matrix(mm):
    for i in range(mm.shape[0]):
        print(" ".join(["{:.2f}".format(x) for x in mm[i,:]]))


parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('-l', '--lang', help='Target language', default=None)
parser.add_argument('-s', '--score', help='Score to calculate ("src_sti_adq", "tgt_src_adq", "tgt_sti_adq", "tgt_flu", "overall")', default=None)
args = parser.parse_args()
    
with open(args.blog3, 'rb') as f:
    data = pickle.load(f)

# Take only successful ones
data = [x for x in data if (not x.invalid) and (len(x.grade_f) != 0)]

data_lang = [x for x in data if x.cid.lang == args.lang]

grades_per_transl_rater = {}
transl_ids = set()

for x in data_lang:
    for viable in x.grade_f + x.grade_v:
        rater_name = viable.user
        transl_id = str(x.sid) + "\t" + viable.tgt
        score = getattr(viable, args.score)
        grades_per_transl_rater.setdefault(rater_name, {})[transl_id] = score if score is not None else 0
        transl_ids.add(transl_id)

rates_matrix = []

for rater_name in sorted(grades_per_transl_rater.keys()):
    rates_for_transl = [grades_per_transl_rater[rater_name].get(transl_id, np.nan) for transl_id in sorted(transl_ids)]
#    print("{:s}'s ratings count: {:d}".format(rater_name, len([x for x in rates_for_transl if not np.isnan(x)])))
    rates_matrix.append(rates_for_transl)

print("{:s} raters on {:s}".format(args.lang, args.score).upper())
print("-----------------------------------------------")

rates_matrix = np.array(rates_matrix, dtype=float)
rates_matrix_masked = ma.masked_invalid(rates_matrix)

corrmat = ma.corrcoef(rates_matrix_masked)
print("Correlation coefficients matrix:")
print_masked_matrix(corrmat)

alpha = krippendorff.alpha(reliability_data=rates_matrix, value_domain=range(1,6), level_of_measurement='ordinal')
print("Krippendorf's alpha: {:.2f}".format(alpha))


