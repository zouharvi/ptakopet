# PHP-like die function
die() { echo "$*" 1>&2 ; exit 1; }

# check a command is installed and in path
assertCommand() { 
    if ! command -v $1 > /dev/null; then
        die "`$1` not installed or not in path"
    else
        echo "$1 OK"
    fi
}

# dot separated version less than equal
verlte() {
    [  "$1" = "`echo -e "$1\n$2" | sort -V | head -n1`" ]
}

# dot separated version less than
verlt() {
    [ "$1" = "$2" ] && return 1 || verlte $1 $2
}

# check a package is installed in at least a given version number
assertPip() {
    version=`pip show $1 2> /dev/null | grep "Version" | sed -e "s/Version: //"`
    if verlt $version $2; then
        die "$1 has to be at least $2 (currently $version)" 
    else
        echo "$1 OK"
    fi
}

TMPDIR=`mktemp -d` 

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

unzip "$TMPDIR/stanford-corenlp-full-2015-01-29.zip" "stanford-corenlp-full-2015-01-29/stanford-corenlp-3.5.1-models.jar" -d "$TMPDIR"
mv "$TMPDIR/stanford-corenlp-full-2015-01-29/stanford-corenlp-3.5.1-models.jar" "qe/questplusplus/lib"

echo "Fetching Universal WordNet plugin"
mkdir -p "qe/questplusplus/lang_resources/uwn"
if ! `wget -q --show-progress http://resources.mpi-inf.mpg.de/yago-naga/uwn/uwn.zip -P $TMPDIR` ; then
    die "Error while downloading"
fi
unzip "$TMPDIR/uwn.zip" -d "qe/questplusplus/lang_resources/uwn"

echo "Installing QuEst++ machine learning"
assertPip "scikit-learn" 0.20.0
assertPip "pyyaml" 0.4.0