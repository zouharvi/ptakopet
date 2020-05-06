import os
import requests
import asyncio
import aiohttp

class Mock():
    """
    Mock up paraphraser
    """
    
    HEADERS = {
        'Accept': 'application/json',
    }
    URL = "https://lindat.mff.cuni.cz/services/translation/api/v2/languages/"
    
    async def roundtrip(self, lang1, lang2, text): 
        data = {'src': lang1, 'tgt': lang2, 'input_text': text}
        #r = requests.post(URL, data=data, headers=HEADERS)
        async with aiohttp.ClientSession() as session:
            async with session.post(self.URL, headers=self.HEADERS, data=data) as r:
                data = await r.json()
                lang2text = "".join(data).rstrip('\n')

        data = {'src': lang2, 'tgt': lang1, 'input_text': lang2text}
        #r = requests.post(URL, data=data, headers=HEADERS)
        async with aiohttp.ClientSession() as session:
            async with session.post(self.URL, headers=self.HEADERS, data=data) as r:
                data = await r.json()
                lang1text = "".join(data).rstrip('\n')

        self.retobj[lang2] = lang1text

    def paraphrase(self, lang, text):
        self.retobj = {'status': 'OK'}

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        langs = ['de', 'fr', 'ru', 'en', 'cs']
        if lang in langs:
            langs.remove(lang)

        for lang2 in langs: 
            loop.run_until_complete(self.roundtrip(lang, lang2, text))

        return self.retobj 

