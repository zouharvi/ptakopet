#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
import estimator
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
            if not ('source' in request.keys() and 'target' in request.keys()):
                raise InvalidDataError 
            text_source = request['source'][0]
            text_target = request['target'][0]
            result = estimator.run(str(text_source).replace('\n', ''), str(text_target).replace('\n', ''))
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
