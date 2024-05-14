"""
The search_engine.py modul contains the method for a search via the search bar.

It uses the library fuzzywuzzy for a Levenshtein distance calculation.

Methods:
    find_path_to_folder(): Find the path to the folder where the documentation information is stored.

    get_web_page_info(about): Get the information of a specific part of the documentation.

    get_all_infos_webpage(): Get the documentation information of all parts of the website.
"""

import os


def find_path_to_folder():
    """Find the path to the folder where the documentation information is stored.

    :return: A string representing the path to the folder with the documentation
    """
    return os.path.join(os.path.dirname(__file__), '../documentation/')


def get_web_page_info(about):
    """Get the information of a specific part of the documentation.

    :param about: The name of the part of the documentation information to be loaded
    :return: A string with the documentation information
    """
    with open(f'{find_path_to_folder()}{about}.html') as f:
        return f.read()


def get_all_infos_webpage():
    """Get the documentation information of all parts of the website.

    :return: A dictionary with the documentation information of all informative parts of the website
    """
    web_page_parts = ['howto', 'credits', 'creators', 'funding']

    web_page_infos = dict()

    for part in web_page_parts:
        web_page_infos[part] = get_web_page_info(part)

    return web_page_infos
