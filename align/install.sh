echo "Installing alignment"
echo "Installing fast_align"
assertCommand "cmake"
assertCommand "gcc -v"
git submodule update --init --recursive align/fast_align 
