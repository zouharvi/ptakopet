# PHP-like die function
die() {
    echo "$*" 1>&2 ;
    exit 1;
}

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

export TMPDIR=`mktemp -d` 


export -f die assertCommand verlt verlte assertPip

./qe/install.sh
./align/install.sh
./server/install.sh