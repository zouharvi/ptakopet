# Technical documentation

Ptakopět has two main components:
- frontend (defined in `web/`)
- backend (defined in `quality_estimation/`)

## Frontend
The frontend is written in plain JavaScript with some minor help of jQuery.

### main.js
This file is the entry point of the frontend part. It binds variables to their HTML equivalents and boostraps other parts of the code. It starts with a check of HTTPS request, which is translated into HTTP, because of issues connected to Mixed Content policy ([ptakopet.vilda.net](http://ptakopet.vilda.net) has vaild SSL certificated installed, but some connected components do not).

### arch.js
This file registers events, that happen on the page and translates them to queries.

### utils.js
This file contains mostly minor textual helper functions, such as tokenizer, sorting permutation calculator and word index calculator).

### translator.js
This file was to some extend migrated from Ptakopět v1. It contains configs for translator backends (Khresmoi and Lindat MT Transformer supported at the moment) and system for relaying requests.

### indicator.js
This file only manages the indicators for translation and estimator requests. The former one may take up to several seconds to finish, so this part is vital for comfortable user experience.

### estimator.js
This file has similar structure to `translator.js`. It contains configs for estimator backends and a system for relaying such requests.

### highlight-within-textarea
This jQuery plugin by _lonekorean_ was forked to [github.com/zouharvi/highlight-within-textarea](https://github.com/zouharvi/highlight-within-textarea), as some minor changes to the internal workings of this plugin were necessary (dynamic style attribute instead of class based).

## Backend

The backends runs at [quest.ms.mff.cuni.cz/zouharvi](http://quest.ms.mff.cuni.cz/zouharvi). The main code runs in Python 3, but contains many interops (through system pipes) to other frameworks written in Python 2, Java, Perl, C++ etc.

### server.py

This is the entrypoint of the backend. It runs `BaseHTTPRequestHandler` and responds to requests for quality estimation and alignment. It is started with a positional argument specifying the port (80 by default).

### fast_align

Alignment is necessary per se (for special requests) as well as for QuEst++. Usage of this system is easy, but requires the input files to be stored in a very specific notation (1 tokenized sentence per line, source separated from the translation by `|||`). See [github.com/clab/fast_align](https://github.com/clab/fast_align).

### QuEst++

The main pipeline of QuEst++ consists of feature extraction and ML prediction. It was not designed for online purposes, so using it is quite cumbersome. The exctractor part is written in Java and the predictor in Python 2. The code is stored in `estimator.py` and `extract_driver.py`. Because of different frameworks, these programs are invoked with system pipes. See [github.com/ghpaetzold/questplusplus](https://github.com/ghpaetzold/questplusplus) and the respective fork at [github.com/zouharvi/questplusplus](https://github.com/zouharvi/questplusplus).

### deepQuest

deepQuest takes neural approach to quality estimation. See [sheffieldnlp.github.io/deepQuest/](https://sheffieldnlp.github.io/deepQuest/).

### Installation

Running:

```
git clone https://github.com/zouharvi/ptakopet
cd ptakopet
git submodule update --init --recursive
```

should download all of the necessary files. Each subsystem (QuEst++ and deepQuest) have each very specific system requirements, hence see their respective documentation. (Note: QuEst++ requires `scikit-learn` to be version `0.15.2`. Newer versions include some API breaking changes.) The server can be launched as:

```
cd v2/quality_estimation
nohup ./server.py 8080 &
```