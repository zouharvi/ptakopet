import pickle
import argparse
import numpy as np
from load import Segment, CID
import krippendorff
from pprint import pprint

parser = argparse.ArgumentParser(description='Ptakopět log processing.')
parser.add_argument('blog3', help='Path to a blog3 file')
parser.add_argument('-l', '--lang', help='Target language', default=None)
parser.add_argument('-s', '--score', help='Score to calculate ("src_sti_adq", "tgt_src_adq", "tgt_sti_adq", "tgt_flu", "overall")', default=None)
#parser.add_argument('-l', '--lang', help='Language', default='cs')
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
        grades_per_transl_rater.setdefault(rater_name, {})[transl_id] = getattr(viable, args.score)
        transl_ids.add(transl_id)


rates_matrix = []

for rater_name in sorted(grades_per_transl_rater.keys()):
    rates_for_transl = [grades_per_transl_rater[rater_name].get(transl_id, np.nan) for transl_id in sorted(transl_ids)]
    rates_matrix.append(rates_for_transl)

alpha = krippendorff.alpha(reliability_data=rates_matrix, value_domain=range(1,6), level_of_measurement='ordinal')
print("Krippendorf's alpha of the {:s} raters on {:s}: {:.2f}".format(args.lang, args.score, alpha))


