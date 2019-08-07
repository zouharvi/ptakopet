# This script assumes the data is stored in examples/estimate/test.(mt|src|)

export KERAS_BACKEND=tensorflow

echo "Analysing input parameters"

task_name="en_de"
src="src"
trg="mt"
score="hter"
out_activation="sigmoid"
device="cpu"

model_type=EncWord
model_name=${task_name}_${src}${trg}_${model_type}
store_path=../../deepQuest-config/saved_models/${task_name}/
rnd_seed=8

# we copy the base config
rm -rf config.*
ln -s ../../deepQuest-config/config-wordQEbRNN.py ./config.py

best_epoch=7

# pre-trained Weights + Vocab to use for scoring
pred_vocab=../../deepQuest-config/saved_models/${task_name}/dataset.pkl

echo "Scoring test."${trg}

THEANO_FLAGS=device=$device python2 main.py TASK_NAME=$task_name DATASET_NAME=$task_name DATA_ROOT_PATH=../../deepQuest-config/data_input SRC_LAN=${src} TRG_LAN=${trg} PRED_SCORE=$score OUT_ACTIVATION=$out_activation MODEL_TYPE=$model_type MODEL_NAME=$model_name STORE_PATH=$store_path PRED_VOCAB=$pred_vocab RELOAD=$best_epoch MODE=sampling SAVE_EACH_EVALUATION=True RND_SEED=$rnd_seed NO_REF=True 1> log-keras.txt 2> log-keras-error.txt

echo "Model output in ../../deepQuest-config/saved_models/${task_name}/test_epoch_"${best_epoch}"_output_0.pred"

# remove created symlink
rm -rf config.*
