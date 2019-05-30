![Ptakopět logo](logo.png)

# User documentation

Ptakopět is hosted at [ptakopet.vilda.net](http://ptakopet.vilda.net) and can be accessed with any modern browser (tested on Firefox 66 and Google Chrome 74).

## Use cases
There are generally two use cases for Ptakopět:
- Translating text to a language you are not really familiar with (outbound translation)
- Estimating the quality of your own translation (simple quality estimation)

## Outbound Translation
In order to perform Outbound Translation, select source and target languages from the select box. Then Write your text in the Source language input window. You can see the problematic words in the source and target text (more intense = worse, purple = not translated) as well as backward translation of the already translated text (Note: having a perfect correspondence between the source and backward texts can be a sign of a very bad translation.)

![highlight example](john_screen.png)

## Quality Estimation

You can follow up from the previous use case with more agile workflow and dynamically edit the translated text. What you will see is the quality estimation of your own translation, as well as backward translation.

## Misc

### Available backends
Currently there are two backends: deepQuest for en-de quality estimatino and QuEst++ for en-es quality estimation. You can select a language pair not compatible with the selected quality estimator, but the result will not be useful.

### Models
All results (either good or bad) are the consequence of the respective models. That is Ptakopět does not create its own translations and quality estimations.

### Asynchrony
Ptakopět is completely asynchronous. Active translation and quality estimation requests can be seen next to the respective select boxes.

### Artifacts
Due to an unresolved bug, you may experience artifacts. This happens after quality estimation is rendered, new translation request is completed and the quality estimation requests has not yet been completed.