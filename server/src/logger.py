from flask import jsonify
import os

if __name__ == 'logger':
    if not os.path.exists('logs/'):
        os.makedirs('logs/')
        print(f'Creating logs dir at {os.getcwd()}/logs')

def organizeData(request):
    order = ['lang1', 'lang2', 'questionKey', 'confidence', 'reason', 'text1', 'text2', 'estimation', 'alignment', 'queue', 'agent']
    result = []
    for o in order:
        if o in request.keys():
            result.append(request.pop(o)) 
    for k in request:
        result.append(f'EXTRA({k}:{request[k]})')
    result = list(map(lambda x: x.replace(',', '&#44;'), result))
    result = list(map(lambda x: x.replace('\n', '<br>'), result))
    return result

def log(sessionID, userID, action, time, **request):
    logFile = f'logs/{userID}.log'
    with open(logFile, 'a') as logFile:
        line = f'{action},{time},{",".join(organizeData(request))}\n'
        print(line, end='')
        logFile.write(line)
    return {'status': 'OK'} 
