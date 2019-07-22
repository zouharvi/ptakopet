import os
from utils import DirCrawler, bash

"""
QuestPlusPlus driver
"""
class QuestPlusPlus():
    def qe(self, sourceLang, targetLang, sourceText, targetText):
        """
        @TODO: documentation
        It's ok to raise Exceptions here. They are handled upstream.
        """
        import os
        with DirCrawler('qe/questplusplus'):
            print("Extracting features")
            (output, error) = bash("""
                 java -cp QuEst++.jar:lib/* shef.mt.WordLevelFeatureExtractor
                 -lang english spanish
                 -input input/source.word-level.en input/target.word-level.es
                 -alignments lang_resources/alignments/alignments.word-level.out
                 -config ../questplusplus-config/config.word-level.properties
                 """)
            # print(output)
            # print(error)
            outputFile = 'output/test/output.txt'
            if not os.path.isfile(outputFile):
                raise Exception('Server Processing Error')
            with open(outputFile, 'r') as outputFileR:
                features = outputFileR.readlines()

            print("Removing output directory structure for feature extractor")
            os.remove(outputFile)
            os.rmdir('output/test')
            os.rmdir('output')

            print("Machine Learning")
            (output, error) = bash("""
                python learning/src/learn_model.py ../questplusplus-config/svr.cfg
                """)
                
            print(output)
            print(error)
            with open('predicted.csv', 'r') as predictedFile:
                output = predictedFile.readlines()
            os.remove('predicted.csv')
            
            return {'status': 'OK', 'qe': output }