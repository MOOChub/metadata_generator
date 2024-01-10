"""
The frameworkprocessor.py is a collection of methods for handling the received data from a client.

It can find the related framework files, extract data from them and convert the into properly formatted data
fragments for the transfer to the client.

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

    write_json(data): Write the JSON files for the competencies and fields of studies and return them as a zip file.

    generate_entry(framework, name, bc): Generate a metadata fragment according to the MOOChub API v3.0 for a single
    competency or field of study (FoS).

    generate_names_of(language, name): Generate a list of sub-fragments containing the name of a competency of field of
    study (FoS) together with the language decoded in compliance with BCP47 according to the MOOChub API v3.0.
"""

import os
import io
import zipfile
import config_handler
import json
import numpy as np
import pandas as pd


def remove_file_ending(file_name):
    """Remove the .csv at the end of a csv file.

    :param file_name: the complete file name including the filename extension
    :return: the name of the file without the filename extension
    """
    return file_name.replace('.csv', '')  # only works for csv so far, could be extended with another logic...


def find_framework_folder():
    """Find the folder the framework files are in.

    :return: the properly formatted path to the framework folder
    """
    return os.path.join(os.path.dirname(__file__), 'frameworks')


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
    return pd.read_csv(path, sep=";", header=0)


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

        all_fields.append({"Name": name, "Level": level, "BroaderConcept": bc, "Description": description})

    return all_fields


def get_all_frameworks():
    """Find all relevant data for the presentation on the clientside.

    :return: a dictionary with the framework name as key and the relevant data for presentation as values as a list
    """
    all_frameworks = {}

    for framework in find_framework_files():
        all_frameworks[framework] = get_all_fields(framework)

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
        all_title_descriptions = all_title_descriptions + find_title_description(framework)

    return all_title_descriptions


def write_json(data):
    """Write the JSON files for the competencies and fields of studies and return them as a zip file.

    :param data: the JSON file received from the client with the competencies and FoS as a dictionary
    :return: a zip file for downloading via the browser
    """
    all_data_fos = []
    all_data_skills = []

    for framework in data.keys():
        for element in data[framework]:
            name = element["Name"]
            bc = element["BroaderConcept"]

            entry = generate_entry(framework, name, bc)

            if entry['type'] == 'EducationalAlignment':
                all_data_fos.append(entry)
            else:
                all_data_skills.append(entry)

    all_data_skills = json.dumps(all_data_skills).encode()
    all_data_fos = json.dumps(all_data_fos).encode()

    data_file = io.BytesIO()

    with zipfile.ZipFile(data_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        if len(all_data_skills) > 2:  # the JSON string should not be empty e.g. len = 2 -> '{}', empty dictionary
            zipf.writestr('skills.json', all_data_skills)
        if len(all_data_fos) > 2:
            zipf.writestr('fos.json', all_data_fos)

    data_file.seek(0)

    return data_file


def generate_entry(framework, name, bc):
    """Generate a metadata fragment according to the MOOChub API v3.0 for a single competency or field of study
    (FoS).

    :param framework: framework of the competency or FoS
    :param name: name of the competency or FoS
    :param bc: the broader concept of the competency or FoS, Can be None
    :return: a dictionary containing the metadata for the competency or FoS, ready to be converted into a JSON file
    """
    config = config_handler.get_config_processor_by_framework(framework)

    path = find_framework_folder()
    path = os.path.join(path, framework + ".csv")

    data = pd.read_csv(path, sep=";", dtype=str)
    data = data[(data["Name"] == name) & (data["BroaderConcept"] == bc)].iloc[-1]  # This guarantees
    # that only one row is selected. It is always the last one. Otherwise, problems could occur if three or more
    # nodes in the path share the same name. In this case, the combination Name - BroaderConcept is ambiguous like
    # in ESCO Construction - construction - construction.

    data.replace({np.nan: None}, inplace=True)

    language = config.LANGUAGE

    data_block = {
        "educationalFramework": framework,
        "url": config.URL,
        "name": generate_names_of(language, name),
        "alternativeName": None,
        "shortCode": data["ShortCode"],
        "targetUrl": data["Uri"],
        "description": data["Description"],
        "type": config.FRAMEWORK_PURPOSE,
        }

    if config.FRAMEWORK_PURPOSE == "EducationalAlignment":
        data_block["alignmentType"] = "educationalSubject"

    return data_block


def generate_names_of(language, name):
    """Generate a list of sub-fragments containing the name of a competency of field of study (FoS) together with
    the language decoded in compliance with BCP47 according to the MOOChub API v3.0.

    :param name: the name of the competency or FoS in the respective language
    :param language: the language the competency or FoS name is given in
    :return: a list containing the metadata fragments as dictionaries
    """
    all_names = list()

    all_names.append({
        "inLanguage": language,
        "name": name,
    })

    return all_names
