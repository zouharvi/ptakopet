#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
import estimator
import align_driver
import sys


class InvalidDataError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


class ServerHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        BaseHTTPRequestHandler.end_headers(self)

    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    # assert keys exist in self.request
    def require_keys(self, keys):
        if not isinstance(keys, (list,)):
            keys = [keys]
        for key in keys:
            if key not in self.request.keys():
                raise InvalidDataError('Missing `' + key + '` parameter')

    # get params from self.request
    def get_param(self, key):
        self.require_keys(key)
        return self.request[key][0]

    # handle POST requests
    def do_POST(self):
        print()
        self._set_response()

        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        response = ""

        try:
            self.request = parse_qs(post_data)
            if self.get_param('request') == 'quality_estimation':
                text_source = str(self.get_param('source')).replace('\n', '')
                text_target = str(self.get_param('target')).replace('\n', '')
                if self.get_param('model') == 'quest++':
                    result = estimator.run_questpp(text_source, text_target)
                    response = json.dumps(result)
                elif self.get_param('model') == 'deepQuest':
                    result = estimator.run_deepQuest(text_source, text_target)
                    response = json.dumps(result)
            elif self.get_param('request') == 'align':
                text_source = str(self.get_param('source')).replace('\n', '')
                text_target = str(self.get_param('target')).replace('\n', '')
                result = align_driver.align(text_source, text_target)
                response = json.dumps(result)
        except InvalidDataError as e:
            response = e.message

        self.wfile.write(response.encode('utf-8'))

    # # supress verbose output
    # def log_message(self, format, *args):
    #     return


def run(port=80):
    httpd = HTTPServer(('', port), ServerHandler)
    print('Starting server')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print('Stopping server')


if __name__ == '__main__':
    if len(sys.argv) > 1:
        run(int(sys.argv[1]))
    else:
        run()
