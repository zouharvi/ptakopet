from flask import jsonify
import os

if __name__ == 'logger':
    if not os.path.exists('logs/'):
        os.makedirs('logs/')
        print(f'Creating logs dir at {os.getcwd()}/logs')

def log(sessionId, action, **request):
    logFile = f'logs/{sessionId}.log'
    with open(logFile, 'a') as logFile:
        # @TODO: verify that join is stable
        line = f'{action},{",".join(request.values())}\n'
        print(line, end='')
        logFile.write(line)
    return {'status': 'OK'} 
