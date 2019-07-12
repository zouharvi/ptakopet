echo "Installing Quality Estimation"
echo "Installing QuEst++ feature extractor"
assertCommand "java"
assertCommand "perl -v"
assertCommand "unzip"
assertCommand "pip"
git submodule update --init --recursive qe/questplusplus 

echo "Fetching Stanford Core NLP 3.5.1 models"
if ! `wget -q --show-progress http://nlp.stanford.edu/software/stanford-corenlp-full-2015-01-29.zip -P $TMPDIR` ; then
    die "Error while downloading"
fi

unzip -o -q "$TMPDIR/stanford-corenlp-full-2015-01-29.zip" "stanford-corenlp-full-2015-01-29/stanford-corenlp-3.5.1-models.jar" -d "$TMPDIR"
mv "$TMPDIR/stanford-corenlp-full-2015-01-29/stanford-corenlp-3.5.1-models.jar" "qe/questplusplus/lib"

echo "Fetching Universal WordNet plugin"
mkdir -p "qe/questplusplus/lang_resources/uwn"
if ! `wget -q --show-progress http://resources.mpi-inf.mpg.de/yago-naga/uwn/uwn.zip -P $TMPDIR` ; then
    die "Error while downloading"
fi
unzip -o -q "$TMPDIR/uwn.zip" -d "qe/questplusplus/lang_resources/uwn"

echo "Installing QuEst++ machine learning"
assertPip "scikit-learn" 0.20.0
assertPip "pyyaml" 0.4.0