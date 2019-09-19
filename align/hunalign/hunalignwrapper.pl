#!/usr/bin/perl
# Runs hunalign on a pair of files, each sentence is assumed to be on a line.
# Prints out a parallel corpus.
# Ondrej Bojar, bojar@ufal.mff.cuni.cz

use strict;
use Getopt::Long;
use File::Temp qw /tempdir/;
use File::Path;
use File::Spec;
use File::Basename;
use POSIX; # ceil

binmode(STDIN, ":utf8");
binmode(STDOUT, ":utf8");
binmode(STDERR, ":utf8");

my $tempdir = "/tmp";
my $mypath = dirname(File::Spec->rel2abs(__FILE__));
my $hunalign = File::Spec->canonpath(
                  $mypath."/../external/hunalign-1.1/hunalign");

my $one_to_one = 0; # print only one-to-one aligned sentences.
my $verbose = 0;
my $keep = 0;
my $cleanup = 0;
my $segdelim = " ";
my $ignore_segfault = 0;

my $dictfile = undef;
my $debugmagic = 0;
my $parfilelist = undef;
my $magic = "HuNaLIgN WrApPeR MaGiC-FiLe-dElImItER";
#my @magic_sequence = ("1ne", "2wo", "thREe.14", "F0ur", "fiv5");
#my @magic_sequence = ("1nesdrtyguh684ehfjksks384rfvbnkopoiukyjgru445678#UI");
my @magic_sequence = ();
my $magic_sequence_size = 5;
my $obey_doc_boundaries = 0;
my $block_delimiter = '#';
my $blank_line_at_file_break = 0;
my $printafname = 0;
my $printbfname = 0;
my $dont_feed_with_blank_lines = 0;
my $method = "singlepass";
my $emit_dict_every_n_files = 10;
my $dict_min_freq = 100;
my $dict_min_dice = 1.0;

# skip pairs where both files have been previously aligned anywhere with a good quality
my $skip_pairs_of_linked_files = 0;
my $needed_quality = 1.5;
my $known_aliquali = undef; # the hash ->{filename}=quality indicating that a
                            # file is already linked to something
# read alignment quality pairs from a cache: quali \t afile \t bfile
my $aliquali_cache_pairs = undef;
my $aliquali_cache_file = undef;

my $origapreproc = undef;
my $origbpreproc = undef;

GetOptions(
  "verbose" => \$verbose,
  "ignore-segfault" => \$ignore_segfault,
  "hunalign=s" => \$hunalign,
  "dict=s" => \$dictfile,
  "one-to-one" => \$one_to_one,
  "tempdir=s" => \$tempdir,
  "keep" => \$keep,
  "cleanup" => \$cleanup,
  "segdelim=s" => \$segdelim,
  "parfilelist=s" => \$parfilelist,
  "magic-sequence-size=i" => \$magic_sequence_size,
  "obey-document-boundaries" => \$obey_doc_boundaries,
  "block-delimiter=s" => \$block_delimiter,
  "blank-line-at-file-break" => \$blank_line_at_file_break,
  "print-afname" => \$printafname,
  "print-bfname" => \$printbfname,
  "dont-feed-with-blank-lines" => \$dont_feed_with_blank_lines,
  "method=s" => \$method,
  "emit-dict-every=i" => \$emit_dict_every_n_files,
  "dict-min-freq=i" => \$dict_min_freq,
  "apreproc=s" => \$origapreproc,
  "bpreproc=s" => \$origbpreproc,
  "skip-pairs-of-linked-files!" => \$skip_pairs_of_linked_files,
    "needed-quality=f" => \$needed_quality,
  "read-aliquali-cache=s" => \$aliquali_cache_file,
) or exit 1;

my $afile = shift;
my $bfile = shift;



if ((!defined $afile || !defined $bfile) && (!defined $parfilelist)) {
  print STDERR "usage: $0 left-file right-file > parallel-corpus
   or: $0 --parfilelist parfilelist > parallel-corpus
Aligns the sentences using hunalign.
Options:
  --hunalign=PATHNAME  ... path to hunalign
  --dict=PATHNAME  ... path to dictionary (two columns of words)
  --one-to-one  ... restrict the alignments to 1-to-1, the default is to
                    join the segments
  --tempdir=/tmp  ... choose a different tempdir
  --keep ... keep the temporary directory
  --cleanup ... unconditionally remove the temporary directory
  --segdelim=' '  ... for segments not aligned 1-1, join the multisegments with
                      this string
  --parfilelist=FNAME ... read and join all files from a two-column filelist
       With singlepass, the third column may specify the output file.
       Hunalign will align better if developing its dictionary from more files.
       (Some magic sequence of a few lines is used to delimit the files.)
  --obey-document-boundaries ... two blank lines in each file are treated
                                 as document boundary and hunalign is
                                 constrained to observe those
  --magic-sequence-size ... size of magic sequence in lines, default is 5
  --blank-line-at-file-break  ... delimit files by blank lines in output
  --dont-feed-with-blank-lines ... use original lines only, even if file differ
                                   in lengths
  --method=twopass    ... when doing a parfilelist, don't join the files but
                          collect dictionary instead and realign all after that
          =singlepass ... when doing a parfilelist, align one by one,
                          don't collect dictionary
          =atonce     ... join all input files to a single one
  --[ab]preproc=trivseg,tok,lc,stem4  ... preprocess file for hunalign
          trivseg     ... breaks lines at [.!?]\\s+[[:upper:]], it does not
                          join wrapped lines
                          WARNING: output unrealiable, only Alignment quality
";
  exit 1;
}

for my $i ( 1 .. $magic_sequence_size ) {
  push(@magic_sequence, "MaGiC-".rand()."-".rand()."-CiGaM");
}

my $apreproc = interpret_preproc($origapreproc);
my $bpreproc = interpret_preproc($origbpreproc);

die "Can't run $hunalign" if ! -x $hunalign;

map { die "Can't find $_" if ! -e $_ } ( $afile, $bfile )
  if !defined $parfilelist;

my $tmp = tempdir("hunalignwrapXXXX", CLEANUP=>0, DIR=>$tempdir);
#print STDERR "My tempdir: $tmp\n";

if (defined $aliquali_cache_file) {
  print STDERR "Reading known alignment qualities from: $aliquali_cache_file\n";
  my $h = my_open($aliquali_cache_file);
  while (<$h>) {
    chomp;
    my ($q, $a, $b) = split /\t/;
    $aliquali_cache_pairs->{$a}->{$b} = $q;
    $aliquali_cache_pairs->{$b}->{$a} = $q;
  }
  close $h;
}

my $ok;
if (defined $parfilelist) {
  die "Don't specify an input file once --parfilelist was given."
    if defined $afile;
  if ($method eq "twopass") {
    # run each file independetly and try to collect the dictionary
    # in a second run, re-align all files using the dictionary
    $ok = parfilelist_file_by_file_improving_dict($parfilelist);
  } elsif ($method eq "singlepass") {
    # run each file independently
    $ok = parfilelist_file_by_file_singlepass($parfilelist);
  } elsif ($method eq "atonce") {
    # combine all files into one big chunk
    $ok = whole_parfilelist_at_once($parfilelist);
  } else {
    die "Bad method: $method";
  }
} else {
  my $processed_dict = "/dev/null";
  my $realign = "-realign";
  if (defined $dictfile) {
    $processed_dict = process_dict($dictfile);
    $realign = "";
  }
  $ok = process_file($afile, $bfile, $processed_dict, $realign, *STDOUT);
}


if (!$cleanup && ($keep || !$ok)) {
  print STDERR "Keeping $tmp, delete yourself.\n";
} else {
  rmtree($tmp);
}
exit !$ok;

sub parfilelist_file_by_file_singlepass {
  my $parfilelist = shift;

  my $fhdl;
  if ($parfilelist eq "-") {
    $fhdl = *STDIN;
  } else {
    $fhdl = my_open($parfilelist);
  }
  my $nr = 0;
  my $processed_dict = "/dev/null";
  $processed_dict = process_dict($dictfile) if defined $dictfile;
  while (<$fhdl>) {
    $nr++;
    chomp;
    my ($afile, $bfile, $mayoutfile) = split /\t/;
    map { die "$parfilelist:$nr: Can't find $_" if ! -e $_ } ( $afile, $bfile );
    my $outh = *STDOUT;
    if (defined $mayoutfile) {
      # assume we are expected to write to the output file
      if (-e $mayoutfile) {
        print STDERR "$nr:Output exists, assuming done: $mayoutfile ($afile $bfile)\n";
        next;
      }
      $outh = my_save($mayoutfile);
    }
    if (!process_file($afile, $bfile, $processed_dict, "", $outh, undef)) {
      print STDERR "Failed to align, skipping: pair $nr: $afile $bfile\n";
      next;
    }
    close $outh if defined $mayoutfile;
  }
  close $fhdl if ($parfilelist ne "-");
  return 1;
}

sub parfilelist_file_by_file_improving_dict {
  my $parfilelist = shift;

  # load parfilelist
  my $fhdl;
  if ($parfilelist eq "-") {
    $fhdl = *STDIN;
  } else {
    $fhdl = my_open($parfilelist);
  }
  my @pfl;
  my $nr = 0;
  while (<$fhdl>) {
    $nr++;
    chomp;
    my ($afile, $bfile) = split /\t/;
    map { die "$parfilelist:$nr: Can't find $_" if ! -e $_ } ( $afile, $bfile );
    push @pfl, [$afile, $bfile];
  }
  close $fhdl if ($parfilelist ne "-");

  my $dict = {};
  my $dictfilesofar = "/dev/null";
  $dictfilesofar = process_dict($dictfile) if defined $dictfile;
  # first align loop, emit dictionary every n files
  for(my $i=0; $i<@pfl; $i++) {
    my ($afile, $bfile) = @{$pfl[$i]};
    my $tmpprefix = $tmp."/pass1.f".sprintf("%0".(ceil(log(scalar@pfl)/log(10)))."i", $i);
    my $tmpparout = $tmpprefix.".par.gz";
    $tmpparout = "/dev/null" unless $keep; # actually dump the files
    my $tmpparouthdl = my_save($tmpparout);
    if (!process_file($afile, $bfile, $dictfilesofar, "", $tmpparouthdl, $dict)) {
      print STDERR "Failed to align, skipping: pair $i: $afile $bfile\n";
      next;
    }
    close $tmpparouthdl;
    unlink($tmpparout); # delete the output

    if ($i && 0 == $i % $emit_dict_every_n_files) {
      print STDERR "Dict keys: ".scalar(keys %{$dict->{a}}).", ".scalar(keys %{$dict->{b}})."\n";
      $dictfilesofar = $tmpprefix.".dict_so_far";
      savedict($dict, $dictfilesofar);
    }
  }

  # dump final dictionary
  $dictfilesofar = $tmp."/dict";
  savedict($dict, $dictfilesofar);

  # second align loop
  for(my $i=0; $i<@pfl; $i++) {
    my ($afile, $bfile) = @{$pfl[$i]};
    if (!process_file($afile, $bfile, $dictfilesofar, "", *STDOUT, undef)) {
      print STDERR "Failed to align, skipping: pair $i: $afile $bfile\n";
      next;
    }
  }
  return 1;
}

sub savedict {
  my $dict = shift;
  my $outfile = shift;

  my $h = my_save($outfile);
  my $outentries = 0;
  foreach my $a (keys %{$dict->{pair}}) {
    foreach my $b (keys %{$dict->{pair}->{$a}}) {
      my $dice = 2*$dict->{pair}->{$a}->{$b} / 
        ($dict->{a}->{$a} + $dict->{b}->{$b} );
      # print STDERR $dict->{pair}->{$a}->{$b}."\t$dice\t$b\t$a\n";
      next if $dict->{pair}->{$a}->{$b} < $dict_min_freq;
      next if $dice < $dict_min_dice;
      print $h "$b\t$a\n"; # hunalign's dict swaps src and tgt
      $outentries ++;
    }
  }
  close $h;
  print STDERR "Emitted dictionary of $outentries: $outfile\n";
}

sub whole_parfilelist_at_once {
  my $parfilelist = shift;
  my $fhdl;
  if ($parfilelist eq "-") {
    $fhdl = *STDIN;
  } else {
    $fhdl = my_open($parfilelist);
  }
  my $processed_dict = "/dev/null";
  my $realign = "-realign";
  if (defined $dictfile) {
    $processed_dict = process_dict($dictfile, 1);
    $realign = "";
  }
  my $tempa = $tmp."/input-a";
  my $tempb = $tmp."/input-b";
  my $tempahdl = my_save($tempa);
  my $tempbhdl = my_save($tempb);
  my $nr = 0;
  while (<$fhdl>) {
    $nr++;
    chomp;
    my ($afile, $bfile) = split /\t/;
    map { die "$parfilelist:$nr: Can't find $_" if ! -e $_ } ( $afile, $bfile );
    # copy both a and b files to the concatenated list
    my $a = my_open($afile);
    my $alen = 0;
    while (<$a>) {
      $alen++;
      print $tempahdl $_;
    }
    close $a;
    my $b = my_open($bfile);
    my $blen = 0;
    while (<$b>) {
      $blen++;
      print $tempbhdl $_;
    }
    close $b;
    # print STDERR "Lengths:\t$alen\t$blen\t$afile\t$bfile\n";
    if (! $dont_feed_with_blank_lines) {
      my $hdl = ( $blen > $alen ? $tempahdl : $tempbhdl );
      my $diff = abs($blen - $alen);
      while ($diff > 0) {
        print $hdl "\n";
        $diff --;
      }
    }
    emit_magic_sequences($nr, $tempahdl, $tempbhdl);
  }
  close $fhdl if ($parfilelist ne "-");
  close $tempahdl;
  close $tempbhdl;
  return process_file($tempa, $tempb, $processed_dict, $realign, *STDOUT);
}

sub emit_magic_sequences {
  # magic sequences are used to delimit documents
  # the sequence is so long and weird that hunalign is very likely to align
  # the src and tgt magics to each other
  my $nr = shift; # current line number, to make the sequence unique
  my $tempahdl = shift;
  my $tempbhdl = shift;
  foreach my $num (@magic_sequence) {
    print $tempahdl "$magic $num $nr $nr\n";
    if ( defined($tempbhdl) ) {
      print $tempbhdl "$magic $num $nr $nr\n";
    }
  }
}

sub process_dict {
  # swap columns in the dict and use my preprocessing
  # possibly add magic tokens, too
  my $inf = shift;
  my $add_magic = shift;

  print STDERR "Preparing $inf as dictionary for hunalign.\n" if $verbose;
  
  my $outf = $tmp."/customdict";
  my $inh = my_open($inf);
  my $outh = my_save($outf);
  while (<$inh>) {
    chomp;
    my ($a, $b) = split /\t/;
    $a = trim($a);
    $b = trim($b);
    die "Dict $inf contains space!" if $a =~ / / || $b =~ / /;
    $a = preprocess($apreproc, $a) if defined $apreproc;
    $b = preprocess($bpreproc, $b) if defined $bpreproc;
    print $outh "$b @ $a\n";
  }
  if ($add_magic) {
    foreach my $num (1..10000, @magic_sequence) {
      my $a = preprocess($apreproc, $num);
      my $b = preprocess($bpreproc, $num);
      print $outh "$b\t$a\n";
    }
  }
  close $inh;
  close $outh;
  return $outf;
}


sub process_file {
  my $afile = shift;
  my $bfile = shift;
  my $dict = shift;
  my $flags = shift;
  my $outstream = shift;
  my $outdictref = shift;

  my $ladderfile = $tmp."/ladder";
  my $logfile = $tmp."/log";

  my $knownq = $aliquali_cache_pairs->{$afile}->{$bfile};
  $knownq = $aliquali_cache_pairs->{$bfile}->{$afile} if !defined $knownq;
  if (defined $knownq) {
    print STDERR "Alignment quality: $knownq\t$afile\t$bfile\t(CACHED)\n";
    if ($skip_pairs_of_linked_files && $knownq >= $needed_quality) {
      # remember the alignment qualitites for both files
      $known_aliquali->{$afile} = $knownq;
      $known_aliquali->{$bfile} = $knownq;
    }
    return 1;
  }

  if ($skip_pairs_of_linked_files
      && defined $known_aliquali->{$afile} && defined $known_aliquali->{$bfile}) {
    print STDERR "Implied (--skip-pairs-of-linked-files): $afile is aligned to something with quality of $known_aliquali->{$afile}, $bfile is aligned with quality of $known_aliquali->{$bfile}\n";
    return 1;
  }

  my $ok = call_hun( $afile, $bfile, $dict, $flags, $ladderfile, $logfile);
  if ($ok) {
    # extract overall alignment quality
    open LG, $logfile or die "Can't read $logfile";
    my $lastline = "";
    while (<LG>) {
      $lastline = $_ if /Quality/;
    }
    close LG;
    my $quality = undef;
    if ($lastline =~ /^Quality ([-e0-9.]+)$/) {
      $quality = $1;
    } else {
      die "Failed to extract quality from $logfile; lastline: $lastline";
    }
    # convert ladder file to the parallel corpus

    my $ahdl = my_open($afile);
    my $bhdl = my_open($bfile);

    print STDERR "Alignment quality: $quality\t$afile\t$bfile\n";
    if ($skip_pairs_of_linked_files && $quality >= $needed_quality) {
      # remember the alignment qualitites for both files
      $known_aliquali->{$afile} = $quality;
      $known_aliquali->{$bfile} = $quality;
    }


    if ($origapreproc =~ /trivseg/ || $origbpreproc =~ /trivseg/ ) {
      print STDERR "Not printing output with --[ab]preproc that includes trivseg\n";
    } else {
      open LAD, $ladderfile or die "Can't read $ladderfile";
      my $lasta = 0; my $lastb = 0;
      my $file_break_printed = 0;
      my $blockid = 0;
      my $lastastring = "";
      my $lastbstring = "";
      my $block_label = "";
      while (<LAD>) {
        next if !/\t.*\t/; # ignore the lexicon part
  #     print $outstream "LINE: $_";
        chomp;
        my ($a, $b, $prob) = split /\t/;
        my $da = $a - $lasta;
        my $db = $b - $lastb;
        $lasta = $a; $lastb = $b;
        # the greps are there to gracefully ignore blank lines in input that
        # clutter output leading to e.g.:
        # 2-1    <nothing> <segdelim> SentA-in-English     SentA-in-Czech
        my @aids = grep { /\S/ } map { $_ = <$ahdl>; chomp $_; $_ } (1..$da);
        my @bids = grep { /\S/ } map { $_ = <$bhdl>; chomp $_; $_ } (1..$db);
        # print STDERR "a $a b $b, da $da db $db, emiteda $emiteda emitedb $emitedb, aids @aids, bids @bids\n";
  #      print $outstream "a $a b $b, da $da db $db, aids @aids, bids @bids\n";
  
        my $alen = scalar(@aids);
        my $blen = scalar(@bids);
  
        next if 0 == $alen && 0 == $blen;
          # this can actually happen only at the very beginning
  
        next if $one_to_one && ($alen != 1 || $blen !=1);
          # skip non-1-1 hunks
  
        my $astring = join($segdelim, @aids);
        my $bstring = join($segdelim, @bids);
  #     print $outstream "A: $astring; B: $bstring\n";
        if (defined $parfilelist || $obey_doc_boundaries) {
          # we were aligning multiple files, we need to remove our magic delims
          if ($astring =~ /$magic/o || $bstring =~ /$magic/o) {
            print STDERR "$astring\t$bstring\n" if $debugmagic;
            print STDERR "Magic out of sync! Dropping some of the input, too.\n"
              if ($da != 1 || $db != 1
                || ($astring =~ /$magic/o xor $bstring =~ /$magic/o));
            print "\n" if $blank_line_at_file_break && !$file_break_printed;
            $file_break_printed = 1;
            next;
          }
        }
  
        if ( $obey_doc_boundaries &&
             $astring eq "" && $bstring eq "" && 
             $lastastring eq "" && $lastbstring eq "" ) {
           $blockid++;
           $block_label = $block_delimiter . $blockid;
        } elsif ( $obey_doc_boundaries == 0 ||
                  ( $astring ne "" || $bstring ne "" )
                ) {
  
          print $outstream $afile, $block_label, "\t" if $printafname;
          print $outstream $bfile, $block_label, "\t" if $printbfname;
          print $outstream $alen, "-", $blen, "\t", $prob,
                           "\t", $astring, "\t", $bstring, "\n";
          $file_break_printed = 0;
        }
  
        if (defined $outdictref && $da == 1 && $db == 1) {
          # collect dictionary from 1-1 sentences
          foreach my $aw (split /\s+/, $astring) {
            $outdictref->{a}->{$aw}++;
            foreach my $bw (split /\s+/, $bstring) {
              $outdictref->{pair}->{$aw}->{$bw}++;
            }
          }
          foreach my $bw (split /\s+/, $bstring) {
            $outdictref->{b}->{$bw}++;
          }
        }
  
        $lastastring = $astring;
        $lastbstring = $bstring;
      }
      die "Some sentences remained in $afile" if !eof($ahdl);
      die "Some sentences remained in $bfile" if !eof($bhdl);
  
  #   exit;
      close LAD;
    } # print output only unless trivseg
    return 1;
  } else {
    print STDERR "Unaligned: $afile, $bfile, see $logfile\n" if !$ok;
    $keep = 1;
    return 0;
  }
  exit;
}

sub call_hun {
  my @file;
  $file[0] = shift;
  $file[1] = shift;
  my $dict = shift;
  my $flags = shift;
  my $hunout = shift;
  my $hunlog = shift;
  my @preproc = ($apreproc, $bpreproc);


  my @usefile;
  foreach my $f (0,1) {
    my $nr = 0;
    if ($file[$f] =~ /\.(bz2|gz)$/ || defined $preproc[$f]) {
      # surely uncompress and possibly preprocess the file
      my $tmpfile = $tmp."/hun.tmpin.$f";
      my $h = my_open($file[$f]);
      my $o = my_save($tmpfile);
      my $lastline = "XX";
      while (<$h>) {
        chomp;
        $_ = preprocess($preproc[$f], $_) if defined $preproc[$f];
#         print STDOUT "INP: $_\n";

        if ( $obey_doc_boundaries && $lastline eq "" && $_ eq "" ) {
#         print STDOUT "INP: EMIT!!!\n";
#         print $o $_."\n";
          emit_magic_sequences($nr, $o, undef);
#         print $o $_."\n";
          $nr++;
          $lastline = "XXXX";
        } else {
          $lastline = $_;         
          print $o $_."\n";
        }



      }
      close $o;
      close $h;
      $usefile[$f] = $tmpfile;
    } else {
      $usefile[$f] = $file[$f];
    }
  }
  # XXX check that the number of magics inserted was identical for 0 and 1
  print STDERR "$hunalign $flags $dict $usefile[0] $usefile[1] > $hunout 2> $hunlog\n";
  system("$hunalign $flags $dict $usefile[0] $usefile[1] > $hunout 2> $hunlog");

  if ($? >> 8) {
    print STDERR "Failed to run $hunalign for $file[0] and $file[1]; see $hunlog\n";
    die unless $ignore_segfault;
    system("rm $hunout");
    return 0;
  }
  if (-z $hunout) {
    # no output produced, these files cannot be aligned
    system("rm $hunout");
    return 0;
  }
  return 1;
}

sub trim {
  my $s = shift;
  $s =~ s/^\s+//g;
  $s =~ s/\s+$//g;
  return $s;
}

sub interpret_preproc {
  my $s = shift;
  return undef if !defined $s;

  my @steps = split /,/, $s;
  foreach my $s (@steps) {
    die "Unrecognized preprocessing step: $s"
      if $s !~ /^(trivseg|tok|lc|stem4)$/;
  }
  return [ @steps ];
}


sub preprocess {
  my $steps = shift;
  my $s = shift;

  foreach my $step (@$steps) {
    if ($step eq "lc") {
      $s = lc($s);
      next;
    }
    if ($step eq "trivseg") {
      $s =~ s/([.?!])\s+([[:upper:]])/$1\n$2/g;
      next;
    }
    if ($step eq "tok") {
      $s =~ s/\b/ /g;
      $s =~ s/\s+/ /g;
      $s = trim($s);
      next;
    }
    if ($step eq "stem4") {
      # this strange stemmer is needed to preserve newlines created by trivseg
      $s = join("", map { /\s/ ? $_ : substr($_, 0, 4) } split /(\s+)/, $s);
      next;
    }
    die "Unrecognized preprocessing step: $step";
  }
  return $s;
}

sub my_open {
  my $f = shift;
  die "Not found: $f" if ! -e $f;
  my $escf = $f;
  $escf =~ s/'/'"'"'/g;
  $escf = "'$escf'";
  # print STDERR "MYOPEN: $f\n";

  my $opn;
  my $hdl;
  my $ft = `file $escf`;
  # file might not recognize some files!
  if ($f =~ /\.gz$/ || $ft =~ /gzip compressed data/) {
    $opn = "zcat $escf |";
  } elsif ($f =~ /\.bz2$/ || $ft =~ /bzip2 compressed data/) {
    $opn = "bzcat $escf |";
  } else {
    $opn = "$f";
  }
  open $hdl, $opn or die "Can't open '$opn': $!";
  binmode $hdl, ":utf8";
  return $hdl;
}

sub my_save {
  my $f = shift;

  my $opn;
  my $hdl;
  # file might not recognize some files!
  if ($f =~ /\.gz$/) {
    $opn = "| gzip -c > $f";
  } elsif ($f =~ /\.bz2$/) {
    $opn = "| bzip2 > $f";
  } else {
    $opn = "> $f";
  }
  open $hdl, $opn or die "Can't write to '$opn': $!";
  binmode $hdl, ":utf8";
  return $hdl;
}
