"""
The app.py contains initial Flask app. This is the entry point for all further interaction.

Here, all routes are listed.

Methods:
    find_path_to_folder(): Find the path to the folder where the documentation information is stored.

    get_web_page_info(about): Get the information of a specific part of the documentation.

    get_all_infos_webpage(): Get the documentation information of all parts of the website.
"""

from flask import Flask, jsonify, render_template, request
from utils import config_helper, webpage_helper, search_engine, helper_functions
from controller.entry_controller import EntryController


app = Flask(__name__)


@app.route('/')
def index():
    """Render the website.

    :return:
    """
    return render_template('index.html')


@app.route('/get_all_configs')
def get_all_configs():
    """Get all configuration information and return it to the website.

    :return: A JSON that contains all configuration data
    """
    return jsonify(config_helper.get_all_configs())


@app.route('/get_all_webpage_infos')
def get_all_webpage_infos():
    """Get all information for the website like a How-To text, imprint, credits, ... etc.

    :return: A JSON containing all information for the website
    """
    return jsonify(webpage_helper.get_all_infos_webpage())


@app.route('/conduct_search')
def conduct_search():
    """Ask the query to the search engine and return the results to the client.

    :return: a JSON file with the search results
    """
    return jsonify(search_engine.search(request.args.get('query')))


@app.route('/get_framework')
def get_framework():
    """Get all entries of specified framework and return them to the website.

    :return: A JSON containing all entries of a framework
    """
    return jsonify(helper_functions.get_all_fields(request.args.get('framework')))


@app.route('/write_zip_file', methods=['POST'])
def write_zip_file():
    """Write the JSON file containing all selected entries, pack it into a ZIP file and return it to the website for
    download by the user.

    :return: A ZIP file containing the JSON file(s) with the selected entries
    """
    return EntryController().write_zip_file()


@app.route('/write_json', methods=['POST'])
def write_json():
    """Write the JSON file containing all selected entries and return it to the user.

    :return: two JSON-like strings file containing the JSON file(s) with the selected entries
    """
    return EntryController().write_json()


app.run()
