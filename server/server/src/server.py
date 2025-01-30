from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import qe, align, tokenizer, paraphraser, logger

# create new Flask app
app = Flask(__name__)
# allow Cross-origin resource sharing access
CORS(app)

CONTENT_TYPE = {'Content-Type': 'application/json; charset=utf-8'}

if __name__ == 'server':
  backends = dict()
  backends['qe'] = {
    'questplusplus': qe.QuestPlusPlus(),
    'deepquest': qe.DeepQuest(),
    'openkiwi': qe.OpenKiwi(),
  }
  backends['align'] = {
    'fast_align': align.FastAlign(),
  }
  backends['tokenize'] = {
    'moses': tokenizer.MosesTokenizer(),
  }
  backends['paraphrase'] = {
    'mock': paraphraser.Mock(),
  }
  
@app.route('/')
def index():
  return 'This is the Ptakopět server. For info about this project or the API please see the <a href="http://ptakopet.vilda.net/docs">documentation</a>.'
  
@app.route('/log', methods = ['GET', 'POST'])
def logService():
  """
  Provides logging service
  """
  try:
    return logger.log(**request.values)
  except Exception as error:
    return {'status': 'FAIL', 'error': str(error) }

@app.route('/login', methods = ['GET', 'POST'])
def loginService():
  """
  Provides logging in service
  """
  try:
    queue = json.load(open('server/baked_queues/study_edin_queue.json', 'r'))
    rest = json.load(open('server/baked_queues/study_edin.json', 'r'))
    print('LOGIN ATTEMPT', request.values['uid'])
    if not request.values['uid'] in queue:
      return {'status': 'FAIL', 'error': 'Non-existent user id.'}
    rest['queue'] = queue[request.values['uid']]
    return rest
  except Exception as error:
    return {'status': 'FAIL', 'error': str(error) }


@app.route('/align/<backend>', methods = ['GET', 'POST'])
def alignService(backend):
  """
  Provides word alignment backend
  """
  #return {'status': 'FAIL', 'error': 'This service is temporarily disabled.'}
  try:
    if not backend in backends['align'].keys():
      raise Exception("Invalid backend selected")
    return json.dumps(backends['align'][backend].align(**request.args)), CONTENT_TYPE
  except Exception as error:
    return {'status': 'FAIL', 'error': str(error) }

@app.route('/tokenize/<backend>', methods = ['GET', 'POST'])
def tokenizeService(backend):
  """
  Provides tokenization backend
  """
  try:
    if not backend in backends['tokenize'].keys():
      raise Exception("Invalid backend selected")
    return json.dumps(backends['tokenize'][backend].tokenize(**request.args), ensure_ascii=False), CONTENT_TYPE
  except Exception as error:
    return {'status': 'FAIL', 'error': str(error) }

@app.route('/qe/<backend>', methods = ['GET', 'POST'])
def qeService(backend):
  """
  Provides quality estimation backend
  """
  return {'status': 'FAIL', 'error': 'This service is temporarily disabled.'}
  try:
    if not backend in backends['qe'].keys():
      raise Exception("Invalid backend selected")
    if len(request.values['sourceLang']) == 0 or len(request.values['targetText']) == 0:
      return jsonify({'status': 'OK', 'qe': []}) 
    return json.dumps(backends['qe'][backend].qe(**request.values), ensure_ascii=False), CONTENT_TYPE
  except Exception as error:
    return {'status': 'FAIL', 'error': str(error) }

@app.route('/paraphrase/<backend>', methods = ['GET', 'POST'])
def paraphraseService(backend):
  """
  Provides mock up paraphrasing backend
  """
  return {'status': 'FAIL', 'error': 'This service is temporarily disabled.'}
  try:
    if not backend in backends['paraphrase'].keys():
      raise Exception("Invalid backend selected")
    return json.dumps(backends['paraphrase'][backend].paraphrase(**request.values), ensure_ascii=False), CONTENT_TYPE
  except Exception as error:
    return {'status': 'FAIL', 'error': str(error) }
