from dir_crawler import DirCrawler

"""
QuestPlusPlus driver
"""
class QuestPlusPlus():
    def qe(self, sourceLang, targetLang, sourceText, targetText):
        import os
        print(os.getcwd())
        with DirCrawler('qe/questplusplus'):
            print(os.getcwd())

        return ""