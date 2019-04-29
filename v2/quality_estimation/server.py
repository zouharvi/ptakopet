#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
import estimator
import align_driver
import sys

class InvalidDataError(Exception):
    pass

class ServerHandler(BaseHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        BaseHTTPRequestHandler.end_headers(self)

    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        response = ""

        try:
            request = parse_qs(post_data)
            if 'request' not in request.keys():
                raise InvalidDataError 
            print(request.keys())
            print(request.values())
            if request['request'][0] == 'quality_estimation':
                if ('source' not in request.keys()) or ('target' not in request.keys()) or ('model' not in request.keys()):
                    raise InvalidDataError 
                text_source = request['source'][0]
                text_target = request['target'][0]
                if request['model'][0] == 'quest++':
                    result = estimator.run_questpp(str(text_source).replace('\n', ''), str(text_target).replace('\n', ''))
                    response = json.dumps(result)
            elif request['request'][0] == 'align':
                print('GOT ALIGN REQUEST')
                if ('source' not in request.keys()) or ('target' not in request.keys()):
                    raise InvalidDataError 
                text_source = request['source'][0]
                text_target = request['target'][0]
                result = align_driver.align(str(text_source).replace('\n', ''), str(text_target).replace('\n', ''))
                response = json.dumps(result)

        except InvalidDataError:
            response = '"source" or "target" missing'

        self._set_response()
        self.wfile.write(response.encode('utf-8'))

def run(port=80):
    httpd = HTTPServer(('', port), ServerHandler)
    print('Starting httpd...')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print('Stopping httpd...')

if __name__ == '__main__':
    if len(sys.argv) > 1:
        run(int(sys.argv[1]))    
    else:
        run()
