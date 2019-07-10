# PHP-like die function
die() { echo "$*" 1>&2 ; exit 1; }

# check a command is installed and in path
assertCommand() { 
    if ! command -v $1 > /dev/null; then
        die "`$1` not installed or not in path"
    fi
}

TMPDIR=`mktemp -d` 

echo "Installing QuEst++"
assertCommand "java"
assertCommand "perl -v"
assertCommand "unzip"
git submodule update --init --recursive qe/questplusplus 

echo "Fetching Stanford Core NLP 3.5.1 models"
if ! `wget -q --show-progress http://nlp.stanford.edu/software/stanford-corenlp-full-2015-01-29.zip -P $TMPDIR` ; then
    die "Error while downloading"
fi

unzip "$TMPDIR/stanford-corenlp-full-2015-01-29.zip" "stanford-corenlp-full-2015-01-29/stanford-corenlp-3.5.1-models.jar" -d "$TMPDIR"
mv "$TMPDIR/stanford-corenlp-full-2015-01-29/stanford-corenlp-3.5.1-models.jar" "qe/questplusplus/lib"