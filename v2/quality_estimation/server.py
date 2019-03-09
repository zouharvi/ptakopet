#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, HTTPServer

class ServerHandler(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        print(post_data)

        self._set_response()
        self.wfile.write("Hello sailor".encode('utf-8'))

def run(port=8080):
    httpd = HTTPServer(('', port), ServerHandler)
    print('Starting httpd...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print('Stopping httpd...\n')

if __name__ == '__main__':
    run()