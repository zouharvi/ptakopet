export FLASK_ENV=development
export FLASK_APP=server/src/server.py

PREVWD=`pwd`
TARGETWD=`realpath "$0" | xargs dirname`
echo "Changing current working directory to the parent directory of this script (project base dir)"
cd "$TARGETWD/../"

python3 -m flask run

echo "Changing current working directory to the previous state"
cd $PREVWD