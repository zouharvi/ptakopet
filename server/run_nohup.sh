PREVWD=`pwd`
TARGETWD=`realpath "$0" | xargs dirname`
echo "Changing current working directory to the parent directory of this script (project base dir)"
cd "$TARGETWD/../"

nohup server/run.sh 1> server/server.log 2> server/server-error.log &

echo "Changing current working directory to the previous state"
cd $PREVWD
