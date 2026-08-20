"""Xyntriq local preview server.
- Serves the site folder on 127.0.0.1:8080.
- Extensionless URLs fall back to .html (e.g. /industries -> industries.html).
- Sends no-store headers so browsers never serve stale pages/media.
"""
import os
import socketserver
import sys
from http.server import SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        p = super().translate_path(path)
        if os.path.isdir(p) or os.path.exists(p):
            return p
        candidate = p + ".html"
        if os.path.exists(candidate):
            return candidate
        return p

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    with socketserver.TCPServer(("127.0.0.1", port), Handler) as httpd:
        print(f"Serving on {port}")
        httpd.serve_forever()
