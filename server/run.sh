export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export FLASK_ENV=development
export FLASK_APP=server/src/server.py

PREVWD=`pwd`
TARGETWD=`realpath "$0" | xargs dirname`
echo "Changing current working directory to the parent directory of this script (project base dir)"
cd "$TARGETWD/../"

python3 -m flask run --port 80 --host 0.0.0.0

echo "Changing current working directory to the previous state"
cd $PREVWD
