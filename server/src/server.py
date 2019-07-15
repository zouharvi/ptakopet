from flask import Flask, request
import os
import qe

app = Flask(__name__)

if __name__ == 'server':
  backends = dict()
  backends['qe'] = {
    'questplusplus': qe.QuestPlusPlus()
  }

@app.route('/')
def index():
  return 'Server Works!'
  
"""
Provides word alignment backend
"""
@app.route('/align/<backend>', methods = ['GET', 'POST'])
def alignment(backend):
  return "Requested: " + backend


"""
Provides quality estimation backend
"""
@app.route('/qe/<backend>', methods = ['GET', 'POST'])
def qe(backend):
  try:
    if not backend in backends['qe'].keys():
      raise Exception("Invalid backend selected")
    # assertArgs(request.args, ['sourceLang', 'targetLang', 'sourceText', 'targetText'])
    return backends['qe'][backend].qe(**request.args)
    return "Selected " + backend
  except Exception as error:
    return str(error)

def assertArgs(args, assertees):
  if type(assertees) is not list:
    assertees = [assertees]
  for assertee in assertees:
    if assertee not in args.keys():
      raise Exception("'{}' is missing".format(assertee))