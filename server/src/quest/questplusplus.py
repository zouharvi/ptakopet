from dir_crawler import DirCrawler

"""
"""
class QuestPlusPlus(DirCrawler):
    def quest(self, sourceLang, targetLang, sourceText, targetText):
        DirCrawler.crawlIn('qe/questplusplus')
        import os
        print(os.getcwd())