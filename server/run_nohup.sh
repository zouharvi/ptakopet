PREVWD=`pwd`
TARGETWD=`realpath "$0" | xargs dirname`
echo "Changing current working directory to the parent directory of this script (project base dir)"
cd "$TARGETWD/../"

nohup server/run.sh > server/server.log &

echo "Changing current working directory to the previous state"
cd $PREVWD
