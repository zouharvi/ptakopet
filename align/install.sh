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