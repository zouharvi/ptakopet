RED='\033[0;31m'
GREEN='\033[0;32m'
NCOL='\033[0m'

# PHP-like die function
die() {
    echo -e "${RED}$*${NCOL}" 1>&2 ;
    exit 1;
}

# check a command is installed and in path
assertCommand() { 
    if ! command -v "$1" > /dev/null; then
        die "$1 not installed or not in path"
    else
        echo -e "$1 ${GREEN}OK${NCOL}"
    fi
}

# dot separated version less than equal
verlte() {
    [  "$1" = '`echo -e "$1\n$2" | sort -V | head -n1`' ]
}

# dot separated version less than
verlt() {
    [ "$1" = "$2" ] && return 1 || verlte $1 $2
}

# check a package is installed in at least a given version number
assertPip2() {
    version=`pip2 show $1 2> /dev/null | grep "Version" | sed -e "s/Version: //"`
    if [ -z "$version" ]; then
        die "$1 is not installed on pip2" 
    elif verlt $version $2; then
        die "$1 has to be at least $2 (currently $version)" 
    else
        echo -e "$1 ${GREEN}OK${NCOL}"
    fi
}

# check a package is installed in at least a given version number
assertPip3() {
    version=`pip3 show $1 2> /dev/null | grep "Version" | sed -e "s/Version: //"`
    if [ -z "$version" ]; then
        die "$1 is not installed on pip3" 
    elif verlt $version $2; then
        die "$1 has to be at least $2 (currently $version)" 
    else
        echo -e "$1 ${GREEN}OK${NCOL}"
    fi
}

export TMPDIR=`mktemp -d` 
export -f die assertCommand verlt verlte assertPip2 assertPip3

# general
assertCommand "pip2"
assertCommand "pip3"

# align
assertCommand "cmake"
assertCommand "gcc"
assertCommand "g++"

# quality estimation
assertCommand "java"
assertCommand "perl"
assertCommand "unzip"
assertPip2 "scikit-learn" 0.20.0
assertPip2 "pyyaml" 0.4.0

assertPip2 "theano"
assertCommand "bash"
echo "Checking python2-devel"
INCLUDE_PY=$(python2 -c "from distutils import sysconfig as s; print s.get_config_vars()['INCLUDEPY']")
if [ ! -f "${INCLUDE_PY}/Python.h" ]; then
    die "Error python2-devel is not installed"
fi

# server
assertCommand "nohup"
assertCommand "python3"
assertCommand "python2"
assertPip3 "flask" 1.0.0
assertPip3 "flask-cors" 3.0.0

./qe/install.sh
./align/install.sh
./server/install.sh