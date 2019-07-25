echo "Installing Ptakopět-server"

echo "Allowing the server to run on the machine's IP address and bind to ports <= 1024"
TARGET_PYTHON3=`which python3`
TARGET_PYTHON3=`readlink -f ${TARGET_PYTHON3}`
sudo setcap CAP_NET_BIND_SERVICE=+eip ${TARGET_PYTHON3}
