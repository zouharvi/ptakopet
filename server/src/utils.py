import os
import subprocess


class DirCrawler():
    """
    Allows child classes to change to their respective folders and then roll back.
    Use crawlIn multiple times, but finally call crawlOut 
    """

    def __init__(self, basePath=''):
        self.basePath = basePath

    def __enter__(self, path=''):
        self.prevPath = os.getcwd()
        os.chdir(self.basePath)

    def __exit__(self, type, value, traceback):
        os.chdir(self.prevPath)


def bash(bashCommand=""):
    """
    Creates a new process and returns its result in UTF-8 (synchronously)
    """
    process = subprocess.Popen(
        bashCommand.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = process.communicate()
    return (output.decode('utf-8'), error.decode('utf-8'))
