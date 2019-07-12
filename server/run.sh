export FLASK_ENV=development
export FLASK_APP=src/server.py

PREVWD=`pwd`
TARGETWD=`realpath "$0" | xargs dirname`
echo "Changing current working directory to the directory of this script"
cd $TARGETWD

python3 -m flask run

echo "Changing current working directory to the previous state"
cd $PREVWD