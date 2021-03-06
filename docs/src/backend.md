The code is hosted as [zouharvi/ptakopet-server](https://github.com/zouharvi/ptakopet-server)

## Build

The multiservice backend is stitched from multiple projects. The server itself is written in Python 3 with Flask WSGI, fast_align is C/C++, QuEst++ uses Java and Python 2 and deepQuest Python3 with Tensorflow. Since the setup for each project is quite cumbersome, ptakopet-server ships with auto install bash script, which checks for dependencies and fetches all necessary files. To build the multiservice backend, execute the following lines of code:

```
git clone https://github.com/zouharvi/ptakopet-server
cd ptakopet-server
./install
```

You may be asked to install some missing dependencies.


## Running the server

To run the server simply run:
```
server/run.sh
```

or if you want your server to run detached and in the background:

```
server/run_nohup.sh
```

By default the server binds to your machine's IP address on the port `:80`. You can check that all went ok by running the following HTTP query:

```
wget "0.0.0.0:80/qe/questplusplus?sourceLang=es&targetLang=en&sourceText=Hola&targetText=Hello"
```

The output should look like:

```
{
  "qe": [
    0.672956
  ], 
  "status": "OK"
}
```

By default the CORS policy is set to permissive.

## API

All requests require the following GET parameters: `sourceLang`, `targetLang`, `sourceText`, `targetText`.

The REST urls are as follows:
- `/qe/questplusplus` for QuEst++ quality estimation
- `/qe/deepQuest` for deepQuest quality estimation
- `/align/fast_align` for fast_align alignment
- `/tokenize/moses` for Moses tokenization
- `/paraphrase/mock` for slow mockup paraphgrasing

The valid responses is always in this JSON Schema (either `qe`, `alignment`, `tokenization` or `paraphrases` is used):

```

  "required": [
    "status"
  ],
  "properties": {
    "qe": {
      "type": "array",
      "items": {
        "type": "number"
      },
    },
    "alignment": {
      "type": "array",
      "items": {
        "type": "string"
      },
    },
    "tokenize": {
      "type": "array",
      "items": {
        "type": "string"
      },
    },
    "paraphrases": {
      "type": "object",
      "items": {
        "type": "string"
      },
    },
    "status": {
      "type": "string",
      "enum": [
        "OK", "FAIL"
      ],
    }
  }
}
```

The alignment value is in the widely used Pharaoh format (`0-1 0-2 1-0`).

For the purposes of [ptakopet.vilda.net](https://ptakopet.vilda.net), the server is active on [quest.ms.mff.cuni.cz/zouharvi](https://quest.ms.mff.cuni.cz/zouharvi).


## Technical design

This diagram describes the overall project architecture as well as relevant data structure.

<img src='https://raw.githubusercontent.com/zouharvi/ptakopet/master/meta/object_design/backend.svg?sanitize=true' style='width: 70%; min-width: 500px'>