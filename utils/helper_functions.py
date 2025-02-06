"""
The helper_functions.py modul contains the helper method for different purposes.

They are mainly intended for processing the framework data.

Methods:
    remove_file_ending(file_name): Remove the .csv at the end of a csv file.

   find_framework_folder(): Find the folder the framework files are in.

   find_framework_files(): Find teh names of the frameworks of the files in the designated folder by removing the file
   ending.

   find_all_data(framework): Retrieve all data from a single framework without further processing.

   get_all_fields(framework): Get the relevant data from a single framework for the presentation on the clientside.

   get_all_frameworks(): Find all relevant data for the presentation on the clientside.

   find_title_description(framework): Find the relevant data of a single, defined framework for the search.

   find_all_title_description(): Find all relevant data from all the frameworks for further processing in the fuzzy
   search.

   extract_row(framework, name, bc): Extract a by name and broader concept defied row of the defined framework.

   generate_names_of(language, name): Generate a list of sub-fragments containing the name of a competency of field of
   study (FoS) together with the language decoded in compliance with BCP47 according to the MOOChub API v3.0.
"""

import os
import pandas as pd
import numpy as np
from utils import config_helper


def remove_file_ending(file_name):
    """Remove the .csv at the end of a csv file.

    :param file_name: the complete file name including the filename extension
    :return: the name of the file without the filename extension
    """
    return file_name.replace('.csv', '')  # only works for csv so far, could be extended with another logic if needed...


def find_framework_folder():
    """Find the folder the framework files are in.

    :return: the properly formatted path to the framework folder
    """
    return os.path.join(os.path.dirname(__file__), '../frameworks')  # path could be moved to a general config


def find_framework_files():
    """Find teh names of the frameworks of the files in the designated folder by removing the file ending.

    :return: a list of framework names based on the filenames of the frameworks (file ending removed)
    """
    folder_path = find_framework_folder()
    files = os.listdir(folder_path)
    return list(map(remove_file_ending, files))


def find_all_data(framework):
    """Retrieve all data from a single framework without further processing.

    :param framework: the name of the framework to gather the data from
    :return: a pandas DataFrame object containing all data from the framework
    """
    path = find_framework_folder()
    path = os.path.join(path, framework + ".csv")

    return pd.read_csv(path, sep=";", header=0)  # TODO: change dtype to string! This will lead to some problems! Fix needed!
    # TODO: If not fixed leading zeros in e.g ISCED-F short codes will be lost!


def get_all_fields(framework):
    """Get the relevant data from a single framework for the presentation on the clientside.

    :param framework: the name of the framework to gather the relevant data for the presentation on the clientside
    :return: a list of dictionaries containing the relevant data for presentation of a single framework
    """
    data = find_all_data(framework)
    data.replace({np.nan: None}, inplace=True)

    all_fields = []

    for index, row in data.iterrows():
        name = row["Name"]
        level = row["Level"]
        bc = row["BroaderConcept"]
        description = row["Description"]

        all_fields.append({"Name": name, "Level": level, "BroaderConcept": bc, "Description": description, 'id': None})
        # id is currently introduced to get a solution with APIs

    return all_fields


def get_all_frameworks():
    """Find all relevant data for the presentation on the clientside.

    :return: a dictionary with the framework name as key and the relevant data for presentation as values as a list
    """
    all_frameworks = {}

    for framework in find_framework_files():
        all_frameworks[framework] = {"fields": get_all_fields(framework),
                                     "full_name": config_helper.get_config_by_name(framework)['FULL_NAME']}

    return all_frameworks


def find_title_description(framework):
    """Find the relevant data of a single, defined framework for the search.

    :param framework: the name of the framework to gather the relevant data for the search
    :return: a list of dictionaries containing the relevant data for the search from a single framework
    """
    data = find_all_data(framework)
    level = int(data["Level"].max())
    data = data[data["Level"] == level]

    to_return = []

    for index, row in data.iterrows():
        to_return.append({"framework": framework, "title": row["Name"], "description": row["Description"],
                          "bc": row["BroaderConcept"], "level": level})

    return to_return


def find_all_title_description():
    """Find all relevant data from all the frameworks for further processing in the fuzzy search.

    :return: A list of dictionaries of all relevant data from all frameworks for the fuzzy search
    """
    frameworks = find_framework_files()

    all_title_descriptions = []
    for framework in frameworks:
        if framework != 'CoKoMo':
            all_title_descriptions = all_title_descriptions + find_title_description(framework)

    return all_title_descriptions


def extract_row(framework, name, bc):
    """Extract a by name and broader concept defied row of the defined framework.

    :param framework: The framework from which the row is extracted
    :param name: The name of the entry
    :param bc: The broader concept of the entry
    :return: The row as specified by framework, name and broader concept
    """
    data = framework[(framework["Name"] == name) & (framework["BroaderConcept"] == bc)].iloc[-1]
    return data.replace({np.nan: None})


def generate_names_of(language, name):
    """Generate a list of sub-fragments containing the name of a competency of field of study (FoS) together with
    the language decoded in compliance with BCP47 according to the MOOChub API v3.0.

    :param name: the name of the competency or FoS in the respective language
    :param language: the language in which the competency or FoS name is given
    :return: a list containing the metadata fragments as dictionaries
    """
    all_names = list()

    all_names.append({
        "inLanguage": language,
        "name": name,
    })

    return all_names


################################################################################################################
# the following part is for interacting with DigCompLevel_full.csv only

def get_data_for_level(level, competence_short_code):
    path = os.path.join(os.path.dirname(__file__) + "/../frameworks/DigCompLevel_full.csv")
    data = pd.read_csv(path, dtype=str)

    data = data[(data["competence"] == str(competence_short_code)) & (data["level"] == str(level))]

    return data["level_name"].item(), data["description"].item()



