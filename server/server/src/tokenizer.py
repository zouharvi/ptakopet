import os
from utils import tokenize
from align import hunalign

class MosesTokenizer():
    """
    Tokenizer driver
    """

    def tokenize(self, text, lang):
        """
        Tokenize input text with moses tokenizer
        """
        texts = text.split('\n')
        out = []
        for t in texts:
            out += tokenize(t, lang, False)
        return {'status': 'OK', 'tokenization': out}
