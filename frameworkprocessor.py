import os
import io
import zipfile
import config_handler
import json
import numpy as np
import pandas as pd


class FrameworkProcessor:

    @staticmethod
    def remove_file_ending(file_name):
        return file_name.replace('.csv', '')

    @staticmethod
    def find_framework_folder():
        return os.path.join(os.path.dirname(__file__), 'frameworks')

    @staticmethod
    def find_framework_files():
        folder_path = FrameworkProcessor.find_framework_folder()
        files = os.listdir(folder_path)
        return list(map(FrameworkProcessor.remove_file_ending, files))

    @staticmethod
    def find_all_data(framework):
        path = FrameworkProcessor.find_framework_folder()
        path = os.path.join(path, framework + ".csv")
        return pd.read_csv(path, sep=";", header=0)

    @staticmethod
    def find_fields(input_params):
        framework = input_params.get('framework')
        value = input_params.get('value')
        level = int(input_params.get('level'))

        data = FrameworkProcessor.find_all_data(framework)

        if value == "None":
            data = data.loc[data["Level"] == level]
        else:
            data = data.loc[(data["Level"] == level) & (data["BroaderConcept"] == value)]
        fields = list(data["Name"])

        fields.sort()
        return fields

    @staticmethod
    def get_all_fields(framework):
        data = FrameworkProcessor.find_all_data(framework)
        data.replace({np.nan: None}, inplace=True)

        all_fields = []

        for index, row in data.iterrows():
            name = row["Name"]
            level = row["Level"]
            bc = row["BroaderConcept"]
            description = row["Description"]

            all_fields.append({"Name": name, "Level": level, "BroaderConcept": bc, "Description": description})

        return all_fields

    @staticmethod
    def get_all_frameworks():

        all_frameworks = {}

        for framework in FrameworkProcessor.find_framework_files():
            all_frameworks[framework] = FrameworkProcessor.get_all_fields(framework)

        return all_frameworks

    @staticmethod
    def find_title_description(framework):
        data = FrameworkProcessor.find_all_data(framework)
        data = data[data["Level"] == data["Level"].max()]

        to_return = []

        for index, row in data.iterrows():
            to_return.append({"framework": framework, "title": row["Name"], "description": row["Description"], "bc": row["BroaderConcept"]})

        return to_return

    @staticmethod
    def find_all_title_description():
        frameworks = FrameworkProcessor.find_framework_files()

        all_title_descriptions = []
        for framework in frameworks:
            all_title_descriptions = all_title_descriptions + FrameworkProcessor.find_title_description(framework)

        return all_title_descriptions

    @staticmethod
    def write_json(data):
        all_data_fos = []
        all_data_skills = []

        for framework in data.keys():
            for element in data[framework]:
                name = element["Name"]
                bc = element["BroaderConcept"]

                entry = FrameworkProcessor.generate_entry(framework, name, bc)

                if entry['type'] == 'EducationalAlignment':
                    all_data_fos.append(entry)
                else:
                    all_data_skills.append(entry)

        all_data_skills = json.dumps(all_data_skills).encode()
        all_data_fos = json.dumps(all_data_fos).encode()

        data_file = io.BytesIO()

        with zipfile.ZipFile(data_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            if len(all_data_skills) > 2:
                zipf.writestr('skills.json', all_data_skills)
            if len(all_data_fos) > 2:
                zipf.writestr('fos.json', all_data_fos)

        data_file.seek(0)

        return data_file

    @staticmethod
    def generate_entry(framework, name, bc):
        config = config_handler.get_config_processor_by_framework(framework)

        path = FrameworkProcessor.find_framework_folder()
        path = os.path.join(path, framework + ".csv")

        data = pd.read_csv(path, sep=";", dtype=str)
        data = data[(data["Name"] == name) & (data["BroaderConcept"] == bc)].iloc[-1]  # This guarantees
        # that only one row is selected. It is always the last one. Otherwise, problems could occur if three or more
        # nodes in the path share the same name. In this case, the combination Name - BroaderConcept is ambiguous like
        # in ESCO Construction - construction - construction.

        data.replace({np.nan: None}, inplace=True)

        data_block = {
            "educationalFramework": framework,
            "url": config.URL,
            "name": FrameworkProcessor.generate_names_of(name),
            "alternativeName": None,
            "shortCode": data["ShortCode"],
            "targetUrl": data["Uri"],
            "description": data["Description"],
            "type": config.FRAMEWORK_PURPOSE,
            }

        if config.FRAMEWORK_PURPOSE == "EducationalAlignment":
            data_block["alignmentType"] = "educationalSubject"

        return data_block

    @staticmethod
    def generate_names_of(value):
        all_names = list()

        all_names.append({
            "inLanguage": "en",
            "name": value,
        })

        return all_names
