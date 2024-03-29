Since Ptakopět is a tool aimed at experiments with outbound translation, different experiments can be easily swapped. User information is logged on a server at Charles University.

# Experiment

The progress per user is stored in local storage of the browser, so users should be instructed to use only one machine and browser to finish their annotations. Each user should have an assigned `userID` by which they log in and can be referenced in the code. The experiment annotation usually proceed as follows:

1. User logs in using `userID`
2. Settings profile is applied
3. Stimulus is shown
4. User tries to respond to the stimulus by input in one of the forms
5. A response is shown (backward translation, quality estimation, paraphrasing)
6. - If the user is satisfied, the click one of the button on the goodness palette (`1` to `5`)
   - If the they are not satisfied, they can change the input (__5.__)
   - If there is a problem, they can click `SKIP` and describe the issue
7. Another stimulus is shown (__3__) from the baked queue (if not empty)

# Experiment description

The experiment can be described by a single JSON file with the following schema:

```
{
    "stimuli": {
        ...,
        "sID": content,
        ...,
    },
    "stimuli_rules": {
        ...,
        "regex": {
            "message": "intro_message",
            "profile": { ...settingsProflie }
        },
        ...
    },
    "users": {
        ...,
        "userID": [
            ["sID", "sID", ...],
            ["sID", "sID", ...]
        ],
        ...,
    }
}
```

## Stimulus

Every stimulus has to have an `sID`. A stimulus can be any text/HTML. It will be placed in a wrapper of max width 930px. The height is not limited, but it should not exceed 300px, as it would take up too much space from the rest of the page. An example stimulus: _"&lt;mark>Niels Bohr&lt;/mark> introduced the first quantized model of the atom in 1913."_

## Stimulus regex

Because there can be multiple types of stimuli in one experiment (as happened in the pilot study), they can utilize different settings. This is done by applying rules to such `sID`s, that match the relevant regex. `sID`s usually look like: `t00, t01, ..., p00, p01, p02, ..`. The regex for the first domain of stimuli is `t..` and for the second is `p..`. All rules are applied (if matching) in sequence as defined in the JSON.

### Stimulus message

It is advisable that there would be an introductory text for each stimulus domain. Such introductory text is displayed above the stimulus and can be (for the previous example): _"Please create a question in the target language which the highlighted segment answers."_

If one wishes to not use introductory texts per stimuli domain, they may use a generic regex `".*"` or set the `message` to `""`.

The introductory message should be a text, but mild HTML styling should work as well. `message` can be omitted in the object definition.

### Stimulus profile

Stimuli can also have different `SettingsProfile`s, which instructs Ptakopět what modules to display and what languages and backends to show. A `SettingsProfile` is also an object of the following form (example):

```
{
    "settings": {
        "backendTranslator": "ufalTransformer",
        "backendEstimator": "openkiwi",
        "backendAligner": "fast_align_ubuntu",
        "language1": "cs",
        "language2": "de",
    },
    "qe": false,
    "mt": true,
    "bt": true,
    "pp": false,
    "manual": false,
}
```

`qe` stands for quality estimation highlighting, `mt` for machine translation output, `bt` for simple backward translation, `pp` for paraphrases using round trip translation and `manual` for displaying/hiding the manual settings block.

Since this definition is too verbose, several things can be omitted. Since in the above example `qe` is set to `false`, then the estimator and aligner backends are irrelevant. Also the `manual` key is set to `false` by default. Hence the above definition can be rewritten as:


```
{
    "settings": {
        "backendTranslator": "ufalTransformer",
        "language1": "cs",
        "language2": "de",
    },
    "qe": false,
    "mt": true,
    "bt": true,
    "pp": false
}
```

`profile` can be omitted in the object definition.

## Users

Every user has to have a `userID`.

### Baked queue

We use the concept of baked queues. This means, that the order of stimuli for a specific user is predetermined by the researcher. Every user should then have a list of `sID`s, which will be shown in sequence. If the user leaves the session (closes the browser), the position in the queue is restored after they log in again.

Every `userID` is associated with an array of array of `stimuliID`. The innermost array correspond to blocks to which the whole queue is segmented.

## Logs

Annotation data from te user are collected in the following way:

| Event code | Logged data | Description |
|-|-|-|
| START      | QUEUE, USER_AGENT | The user logs in |
| NEXT       | SID, REASON | A stimulus is shown |
| CONFIRM    | SID, CONFIDENCE, TXT1, TXT2 | User accepts solution |
| SKIP       | REASON | User skips stimulus |
| TRANSLATE1 | TXT1, TXT2 | Forward translation is displayed |
| TRANSLATE2 | TXT2, TXT3 | Backward translation is displayed |
| ESTIMATE   | ESTIMATION | Quality estimation is computed |
| ALIGN      | ALIGNMENT  | Alignment is computed |
| PARAPHRASE | PARAPHRASES | Paraphrases are displayed, joined by `|` |
| NOTE       | NOTE  | User sends a note |

Additionally, each logged event contains Unix timestamp in milliseconds.