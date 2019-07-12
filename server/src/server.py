from flask import Flask, request
import os
import quest

app = Flask(__name__)

if __name__ == 'server':
  backends = dict()
  backends['quest'] = {
    'questplusplus': quest.QuestPlusPlus()
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
@app.route('/quest/<backend>', methods = ['GET', 'POST'])
def quest(backend):
  print(request.args)
  if not backend in backends['quest'].keys():
    return "Invalid backend selected"
  else:
    return "Selected " + backend