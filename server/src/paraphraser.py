import os
import requests

class Mock():
    """
    Mock up paraphraser
    """

    def paraphrase(self, lang, text):
        def roundtrip(lang1, lang2, text): 
            URL = "https://lindat.mff.cuni.cz/services/translation/api/v2/languages/"
            HEADERS = {'Accept': 'application/json'}
            data = {'src': lang1, 'tgt': lang2, 'input_text': text}
            r = requests.post(URL, data=data, headers=HEADERS)
            lang2text = "".join(r.json())
            data = {'src': lang2, 'tgt': lang1, 'input_text': lang2text}
            r = requests.post(URL, data=data, headers=HEADERS)
            lang1text = "".join(r.json())
            return lang1text
        
        retobj = {'status': 'OK'}
        for lang2 in ['de', 'fr', 'ru', 'en']:
            if lang != lang2:
                retobj[lang2] = roundtrip(lang, lang2, text)
            
        return retobj 
