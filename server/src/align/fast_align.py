import os
from utils import DirCrawler, bash, formatParallel, tokenize

class FastAlign():
    """
    fast_align driver
    """

    def findRawData(self, sourceLang, targetLang):
        def fileTemplate(a, b, c):
            return "data/align/Ubuntu.{}-{}.{}".format(a, b, c)

        if (os.path.isfile(fileTemplate(sourceLang, targetLang, sourceLang)) and
                os.path.isfile(fileTemplate(sourceLang, targetLang, targetLang))):
            return fileTemplate(sourceLang, targetLang, sourceLang), fileTemplate(sourceLang, targetLang, targetLang)
        elif (os.path.isfile(fileTemplate(targetLang, sourceLang, sourceLang)) and
              os.path.isfile(fileTemplate(targetLang, sourceLang, targetLang))):
            return fileTemplate(targetLang, sourceLang, sourceLang), fileTemplate(targetLang, sourceLang, targetLang)

        raise Exception("Relevant raw data for {}, {} not found".format(
            sourceLang, targetLang))

    def align(self, sourceLang, targetLang, sourceText, targetText):
        """
        Performs word alignment on sourceText to targetText using fast_align.
        The output is in well known Pharaoh format.
        It's ok to raise Exceptions here. They are handled upstream.
        """
        file1, file2 = self.findRawData(sourceLang, targetLang)
        out = formatParallel(file1, file2)

        sourceText = tokenize(sourceText, sourceLang)
        targetText = tokenize(targetText, targetLang)

        out = ["{} ||| {}".format(sourceText, targetText)] + out
        # Found relevant parallel corpus
        print("Files found: {}, {}".format(file1, file2))

        with open('tmp.parallel', 'w') as tmpFile:
            print('\n'.join(out), file=tmpFile)
        (output, _) = bash("align/fast_align/build/fast_align -d -o -v -i tmp.parallel")
        os.remove('tmp.parallel')
        
        # @TODO: Check all went OK
        # If tokens will be used, check number of resulting tokens
        return {'status': 'OK', 'alignment': output.split('\n')[0]}
