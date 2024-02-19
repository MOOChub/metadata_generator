"""
The app.py module with the Flask application to organize the communication from the server side.

Methods:
    index(): Show the initial web page.

    get_all_frameworks(): Gather all frameworks data and return them to the client.

    write_json(): Take all received competencies and fields of study (FoS) and generate a zip file containing the
    respective metadata fragments according to the MOOChub API v3.0.

    conduct_search(): Ask the query to the search engine and return the results to the client.
"""

import json

from flask import Flask, request, send_file, render_template, jsonify, Markup
import frameworkprocessor as fp
import search_engine

app = Flask(__name__)


@app.route('/')
def index():
    """Show the initial web page.

    :return: the rendered starting page
    """
    files = fp.find_framework_files()  # the names of the frameworks to be included in the initial dropdown menu
    docs = []
    with open("documentation/documentation.html", "r") as file:  # prepare the documentation file for the html
        data = file.read().split("\n")
        for i in range(3, len(data)):
            docs.append(Markup(data[i]))
            
    return render_template('index.html', files=files, documentation=docs)


@app.route('/get_all_frameworks')
def get_all_frameworks():
    """Gather all frameworks data and return them to the client.

    :return: a JSON file containing the data of all frameworks
    """
    all_frameworks = fp.get_all_frameworks()
    all_frameworks = json.dumps(all_frameworks)

    return jsonify(all_frameworks)


@app.route('/write_json', methods=['POST'])
def write_json():
    """Take all received competencies and fields of study (FoS) and generate a zip file containing the respective
    metadata fragments according to the MOOChub API v3.0.

    :return: a zip file with the respective metadata fragments
    """
    received_fields = request.get_json()
    buffer = fp.write_json(received_fields)
    response = send_file(buffer, mimetype='application/zip')
    response.headers['Content-Disposition'] = 'attachment; filename=download.zip'

    return response


@app.route('/conduct_search')
def conduct_search():
    """Ask the query to the search engine and return the results to the client.

    :return: a JSON file with the search results
    """
    query = request.args.get('query')
    results = search_engine.search(query)
    results = json.dumps(results)  # Important! search method returns a list of dictionaries!

    return jsonify(results)


@app.route('/get_credits')
def get_credits():
    with open('documentation/credits.html') as f:
        credits_footer = f.read()
    return credits_footer


@app.route('/get_funding')
def get_funding():
    with open('documentation/funding.html') as f:
        funding_footer = f.read()
    return funding_footer


@app.route('/get_creators')
def get_creators():
    with open('documentation/creators.html') as f:
        creators_footer = f.read()
    return creators_footer


app.run()
