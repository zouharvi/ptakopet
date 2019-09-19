echo "Installing alignment"
echo "Installing fast_align"
git submodule update --init --recursive align/fast_align

rm -rf ./align/fast_align/build
mkdir -p ./align/fast_align/build
cd ./align/fast_align/build
cmake ..
make
cd ../../..

echo "Fetching Ubuntu 14.04 parallel data"
if ! `wget -q --show-progress "https://ptakopet.vilda.net/data/align_ubuntu.tar.xz" -P "$TMPDIR"` ; then
    die "Error while downloading"
fi
mkdir -p "data/align"
tar -C "data/align" -xf "$TMPDIR/align_ubuntu.tar.xz"

echo "Installing Hunalign"
git submodule update --init --recursive align/hunalign/hunalign
cd align/hunalign/hunalign/src/hunalign
make
cd ../../../../..
