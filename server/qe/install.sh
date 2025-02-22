echo "Installing Quality Estimation"
echo "Installing QuEst++ feature extractor"
git submodule update --init --recursive qe/questplusplus 

echo "Fetching Stanford Core NLP 3.5.1 models"
if ! `wget -q --show-progress "https://nlp.stanford.edu/software/stanford-corenlp-full-2015-01-29.zip" -P "$TMPDIR"` ; then
    die "Error while downloading"
fi

unzip -o -q "$TMPDIR/stanford-corenlp-full-2015-01-29.zip" "stanford-corenlp-full-2015-01-29/stanford-corenlp-3.5.1-models.jar" -d "$TMPDIR"
mv "$TMPDIR/stanford-corenlp-full-2015-01-29/stanford-corenlp-3.5.1-models.jar" "qe/questplusplus/lib"

echo "Fetching Stanford Core Spanish models"
if ! `wget -q --show-progress "https://nlp.stanford.edu/software/stanford-spanish-corenlp-2015-01-08-models.jar" -P "$TMPDIR"` ; then
    die "Error while downloading"
fi

mv "$TMPDIR/stanford-spanish-corenlp-2015-01-08-models.jar" "qe/questplusplus/lib"


echo "Fetching Universal WordNet plugin"
mkdir -p "qe/questplusplus/lang_resources/uwn"
if ! `wget -q --show-progress "http://resources.mpi-inf.mpg.de/yago-naga/uwn/uwn.zip" -P "$TMPDIR"` ; then
    die "Error while downloading"
fi
unzip -o -q "$TMPDIR/uwn.zip" -d "qe/questplusplus/lang_resources/uwn"


echo "Fetching WMT18 preprocessed data"
if ! `wget -q --show-progress "https://ptakopet.vilda.net/data/WMT18.en-cs.train.tar.xz" -P "$TMPDIR"` ; then
    die "Error while downloading"
fi
mkdir -p "data/questplusplus"
tar -C "data/questplusplus" -xf "$TMPDIR/WMT18.en-cs.train.tar.xz"

echo "Installing QuEst++ machine learning"
echo "Done"
echo "Don't forget to rebuild the QuEst++ jar file if it hasn't been patched yet."
echo "Use the command: ant \"-Dplatforms.JDK_1.8.home=/usr/lib/jvm/java-1.8.0\""

echo "Installing deepQuest"
git submodule update --init --recursive qe/deepQuest
if [ -d 'src/' ]; then
    die "The root directory 'src/' already exists, but it's also the tmp location for coco-caption"
fi

pip2 install --user -r qe/deepQuest/requirements.txt

echo "Removing coco-caption dirty install directory (potentially dangerous)"
rm -rf src/

echo "Fetching deepQuest trained models"
if ! `wget -q --show-progress "https://ptakopet.vilda.net/data/deepquest_models.tar.xz" -P "$TMPDIR"` ; then
    die "Error while downloading"
fi
mkdir -p "qe/deepQuest-config/saved_models"
tar -C "qe/deepQuest-config/saved_models" -xf "$TMPDIR/deepquest_models.tar.xz"

echo "Installing OpenKiwi"
# for input output piping
mkdir -p "qe/openkiwi-config/data"
echo "Fetching openkiwi trained models"
if ! `wget -q --show-progress "https://ptakopet.vilda.net/data/openkiwi_models.tar.xz" -P "$TMPDIR"` ; then
    die "Error while downloading"
fi
tar -C "qe/openkiwi-config" -xf "$TMPDIR/openkiwi_models.tar.xz"
