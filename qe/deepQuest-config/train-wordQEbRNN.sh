#
#

export KERAS_BACKEND=theano
echo "Analysing input parameters"

src="cs"
trg="de"
task_name="${src}_${trg}"
score="tags"
out_activation="sigmoid"
device="cpu"

patience=10
model_type=EncWord
model_name=${task_name}_${model_type}
store_path=trained_models/${model_name}/
rnd_seed=8

# we copy the base config
rm -rf config.*
ln -s ../../deepQuest-config/config-train-wordQEbRNN.py ./config.py

echo "Traning the model "${model_name}
THEANO_FLAGS=device=$device python2 main.py TASK_NAME=$task_name DATASET_NAME=$task_name DATA_ROOT_PATH="../../../data/$task_name" SRC_LAN=${src} TRG_LAN=${trg} PRED_SCORE=$score OUT_ACTIVATION=$out_activation MODEL_TYPE=$model_type MODEL_NAME=$model_name STORE_PATH=$store_path NEW_EVAL_ON_SETS=val PATIENCE=$patience SAVE_EACH_EVALUATION=True RND_SEED=$rnd_seed > log-${model_name}-prep.txt 2> log-${model_name}-prep-error.txt

awk '/^$/ {nlstack=nlstack "\n";next;} {printf "%s",nlstack; nlstack=""; print;}' log-${model_name}-prep-error.txt > log-${model_name}-error.txt
best_epoch=$(tail -1 log-${model_name}-error.txt | tr ':' '\n' | tr ' ' '\n' | tail -5 | head -1)

# pre-trained Weights + Vocab to use for scoring
pred_vocab=saved_models/${model_name}/Dataset_${task_name}_${src}${trg}.pkl
pred_weights=saved_models/${model_name}/epoch_${best_epoch}_weights.h5

mkdir -p saved_models/${model_name}
cp datasets/Dataset_${task_name}_${src}${trg}.pkl saved_models/${model_name}
cp trained_models/${model_name}/epoch_${best_epoch}_weights.h5 saved_models/${model_name}

echo 'Best model weights are dumped into 'saved_models/${model_name}/epoch_${best_epoch}_weights.h5

# remove created symlink
rm -rf config.*
