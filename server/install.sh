echo "Installing Ptakopět-server"
assertCommand "nohup"
assertCommand "python3"
assertCommand "python2"
assertPip3 "flask" 1.0.0
assertPip3 "flask-cors" 3.0.0

echo "Allowing the server to run on the machine's IP address and bind to ports <= 1024"
TARGET_PYTHON3=`readlink -f /bin/python3`
sudo setcap CAP_NET_BIND_SERVICE=+eip ${TARGET_PYTHON3}