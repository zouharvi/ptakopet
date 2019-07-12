from flask import Flask, request
app = Flask(__name__)

print("starting up")

@app.route('/')
def index():
  return 'Server Works!'
  
@app.route('/greet')
def say_hello():
  return 'Hello from Server'

"""
Provides word alignment backend
"""
@app.route('/align/<backend>', methods = ['GET', 'POST'])
def alignment(backend):
  print(request.args)
  return "requested: " + backend