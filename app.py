"""
The app.py module with the Flask application to organize the communication from the server side.

Methods:
    index(): Show the initial web page.

    get_all_frameworks(): Gather all frameworks data and return them to the client.

    write_json(): Take all received competencies and fields of study (FoS) and generate a zip file containing the
    respective metadata fragments according to the MOOChub API v3.0.

    conduct_search(): Ask the query to the search engine and return the results to the client.
"""
from flask import Flask, render_template
from utils import helper_build_webpage, search_engine
from controller.framework_controller import FrameworkController
from controller.entry_controller import EntryController

app = Flask(__name__)

framework_controller = FrameworkController()


@app.route('/')
def index():
    """Show the initial web page.

    :return: the rendered starting page
    """
    return render_template('index.html')


@app.route('/get_all_frameworks')
def get_all_frameworks():
    """Gather all frameworks data and return them to the client.

    :return: a JSON file containing the data of all frameworks
    """
    return framework_controller.get_all_frameworks()


@app.route('/write_json', methods=['POST'])
def write_json():
    """Take all received competencies and fields of study (FoS) and generate a zip file containing the respective
    metadata fragments according to the MOOChub API v3.0.

    :return: a zip file with the respective metadata fragments
    """
    return EntryController().write_json()


@app.route('/conduct_search')
def conduct_search():
    """Ask the query to the search engine and return the results to the client.

    :return: a JSON file with the search results
    """
    return search_engine.search()


@app.route('/get_credits')
def get_credits():
    return helper_build_webpage.get_web_page_info('credits')


@app.route('/get_funding')
def get_funding():
    return helper_build_webpage.get_web_page_info('funding')


@app.route('/get_creators')
def get_creators():
    return helper_build_webpage.get_web_page_info('creators')


@app.route('/get_howto')
def get_howto():
    return helper_build_webpage.get_web_page_info('howto')


@app.route('/get_framework_names')
def get_framework_names():
    return helper_build_webpage.get_framework_names()


app.run()
