echo "Installing alignment"
echo "Installing fast_align"
git submodule update --init --recursive align/fast_align 

rm -rf ./align/fast_align/build
mkdir -p ./align/fast_align/build
cd ./align/fast_align/build
cmake ..
make
cd ../../..

echo "Installing eflomal"
# mkdir ./build
# make
# make install -e INSTALLDIR=./build
# python3 setup.py install --user
# python3 ./align.py --help

echo "Don't forget to rebuild the QuEst++ jar file if it hasn't been patched yet."
echo "Use the command: ant \"-Dplatforms.JDK_1.8.home=/usr/lib/jvm/java-1.8.0\""