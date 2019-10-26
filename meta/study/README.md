There are several temporary formats related to log processing:

## .log
Raw log file collected from users. It is interleaved csv (grepping it by the first token results in regular csv). Row formats are:

```
START,<timestamp>,<dash separated sequence of sid queue>
NEXT,<timestamp>,<next sid>,<optional comment to previous stimuli>
TRANSLATE1,<timestamp>,<source sentence>,<target sentence>
TRANSLATE2,<timestamp>,<target sentence>,<backward sentence>
ESTIMATE,<timestamp>,<dash separated quality estimation for target>
ALIGN,<timestamp>,<dash separated quality estimation for source>
CONFIRM,<timestamp>,<source sentence>,<target sentence>
```

## blog
Pickled binary log. The logs are split into segments (corresponds to one stimuli) and the timestamps are normalized with respect to the segment's beginning. Furthemore the lines are prefixed by a new column - the annotator's id.

## SR1
Each segment progression is turned into the sequence: `<src>,<target>,<back>`.

## SR2
Each segment progression is turned into the sequence: `<src>`.

## SR3
Each segment progression is turned into the last two available values for: `<src>,<back>`.

## SR4
Each segment progression is turned into: `<viable>, <src final>, <target final>, <similarity>, <edit types>`

An example:
```
First: Text nelze upravovat ani když na něj klikneme dvakrát dvojitém kliknutí.
Final: Text nelze upravovat, ani když na něj kliknu dvakrát.
Translation: Der Text kann nicht geändert werden, selbst wenn ich zweimal auf ihn klicke.
Similarity: 80.00%
Similarity: 80.00%
Equals/Replace/Insert/Delete: 8/1/0/2
```