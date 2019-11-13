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

        texts = tokenize(text, lang, False)
        return {'status': 'OK', 'tokenization': texts}
