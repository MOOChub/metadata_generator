import json

from flask import Flask, request, send_file, render_template, jsonify, Markup
from frameworkprocessor import FrameworkProcessor, DataStorage
import search_engine

app = Flask(__name__)

stored_values = DataStorage()


@app.route('/')
def index():
    files = FrameworkProcessor.find_framework_files()
    docs = []
    with open("documentation/documentation.txt", "r") as file:
        data = file.read().split("\n")
        for i in range(3, len(data)):
            docs.append(Markup(data[i]))
            
    return render_template('index.html', files=files, documentation=docs)


@app.route('/get_all_frameworks')
def get_all_frameworks():
    all_frameworks = FrameworkProcessor.get_all_frameworks()
    all_frameworks = json.dumps(all_frameworks)

    return jsonify(all_frameworks)


@app.route('/write_json', methods=['POST'])
def write_json():
    received_fields = request.get_json()
    buffer = FrameworkProcessor.write_json(received_fields)
    response = send_file(buffer, mimetype='application/zip')
    response.headers['Content-Disposition'] = 'attachment; filename=download.zip'

    return response


@app.route('/conduct_search')
def conduct_search():
    query = request.args.get('query')
    results = search_engine.search(query)
    results = json.dumps(results)

    return jsonify(results)


app.run()
