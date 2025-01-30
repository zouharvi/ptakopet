# This script assumes the data is stored in ../../deepQuest-config/saved_models/${task_name}/
# First positional argument is the task name
# Second positional argument is the number of the best epoch

export KERAS_BACKEND=tensorflow
echo "Analysing input parameters"

src="src"
trg="trg"
score="tags"
out_activation="sigmoid"
device="cpu"
best_epoch=$2
task_name=$1

model_type=EncWord
model_name=${task_name}_${model_type}
store_path=../../deepQuest-config/saved_models/${task_name}/
rnd_seed=8

# we copy the base config
rm -rf config.*
ln -s ../../deepQuest-config/config-wordQEbRNN.py ./config.py

# pre-trained Weights + Vocab to use for scoring
pred_vocab=../../deepQuest-config/saved_models/${task_name}/dataset.pkl

echo "Scoring test."${trg}

THEANO_FLAGS=device=$device python2 main.py TASK_NAME=$task_name DATASET_NAME=$task_name DATA_ROOT_PATH=../../deepQuest-config/data_input SRC_LAN=${src} TRG_LAN=${trg} PRED_SCORE=$score OUT_ACTIVATION=$out_activation MODEL_TYPE=$model_type MODEL_NAME=$model_name STORE_PATH=$store_path PRED_VOCAB=$pred_vocab RELOAD=$best_epoch MODE=sampling SAVE_EACH_EVALUATION=True RND_SEED=$rnd_seed NO_REF=True 1> log-keras.txt 2> log-keras-error.txt

echo "Model output in ../../deepQuest-config/saved_models/${task_name}/test_epoch_"${best_epoch}"_output_0.pred"

# remove created symlink
rm -rf config.*
