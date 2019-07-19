from flask import Flask, request, jsonify
import os
import qe
import align

app = Flask(__name__)

if __name__ == 'server':
  backends = dict()
  backends['qe'] = {
    'questplusplus': qe.QuestPlusPlus()
  }
  backends['align'] = {
    'fast_align': align.FastAlign()
  }

@app.route('/')
def index():
  return 'This is the Ptakopět server. For info about this project or the API please see the <a href="http://ptakopet.vilda.net/docs">documentation</a>.'
  
@app.route('/align/<backend>', methods = ['GET', 'POST'])
def alignService(backend):
  """
  Provides word alignment backend
  """
  try:
    if not backend in backends['align'].keys():
      raise Exception("Invalid backend selected")
    assertArgs(request.args, ['sourceLang', 'targetLang', 'sourceText', 'targetText'])
    return jsonify(backends['align'][backend].align(**request.args))
  except Exception as error:
    return {'status': 'FAIL', 'error': str(error) }


@app.route('/qe/<backend>', methods = ['GET', 'POST'])
def qeService(backend):
  """
  Provides quality estimation backend
  """
  try:
    if not backend in backends['qe'].keys():
      raise Exception("Invalid backend selected")
    assertArgs(request.args, ['sourceLang', 'targetLang', 'sourceText', 'targetText'])
    return jsonify(backends['qe'][backend].qe(**request.args))
  except Exception as error:
    return {'status': 'FAIL', 'error': str(error) }

def assertArgs(args, assertees):
  if type(assertees) is not list:
    assertees = [assertees]
  for assertee in assertees:
    if assertee not in args.keys():
      raise Exception("Parameter '{}' is missing".format(assertee))