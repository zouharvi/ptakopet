import os

"""
Allows child classes to change to their respective folders and then roll back.
Use crawlIn multiple times, but finally call crawlOut 
"""
class DirCrawler():
    basePath = ''

    def crawlIn(self, path=''):
        # only store the base path if transaction is starting
        if self.basePath == '':
            self.basePath = os.getcwd()
        os.chdir(path)

    def crawlOut(self, path=''):
        os.chdir(self.basePath)
        self.basePath = ''