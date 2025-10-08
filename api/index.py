"""
Vercel serverless function entry point
"""
import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app

# Vercel handler
def handler(request):
    return app(request.environ, lambda *args: None)
