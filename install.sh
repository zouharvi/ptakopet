# PHP-like die function
die() { echo "$*" 1>&2 ; exit 1; }

# check a command is installed and in path
assertCommand() { 
    if ! command -v $1 > /dev/null; then
        die "$1 not installed or not in path"
    fi
}

assertCommand "java"

git submodule update --init --recursive