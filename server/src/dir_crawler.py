import os

"""
Allows child classes to change to their respective folders and then roll back.
Use crawlIn multiple times, but finally call crawlOut 
"""
class DirCrawler():
    def __init__(self, basePath=''):
        self.basePath = basePath
        print("doing init")

    def __enter__(self, path=''):
        # only store the base path if transaction is starting
        self.prevPath = os.getcwd()
        os.chdir(self.basePath)
        print("doing enter")

    def __exit__(self, type, value, traceback):
        os.chdir(self.prevPath)
        print("doing exit")