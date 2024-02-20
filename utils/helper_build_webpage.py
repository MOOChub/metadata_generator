import json
import os
from utils import helper_functions
from flask import jsonify


def find_path_to_folder():
    return os.path.join(os.path.dirname(__file__), '../documentation/')


def get_web_page_info(about):
    with open(f'{find_path_to_folder()}{about}.html') as f:
        return f.read()


def get_framework_names():
    return helper_functions.find_framework_files()


def get_all_infos_webpage():
    web_page_parts = ['howto', 'credits', 'creators', 'funding']

    web_page_infos = dict()
    web_page_infos['names'] = get_framework_names()

    for part in web_page_parts:
        web_page_infos[part] = get_web_page_info(part)

    return jsonify(web_page_infos)