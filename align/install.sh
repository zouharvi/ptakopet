echo "Installing alignment"
echo "Installing fast_align"
assertCommand "cmake"
assertCommand "gcc -v"
git submodule update --init --recursive align/fast_align 

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