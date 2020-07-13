from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.route('/')
def index():
    return "TODO: Build this"

if __name__ == '__main__':
    app.run(debug=True)