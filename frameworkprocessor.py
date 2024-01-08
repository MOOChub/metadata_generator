import os
import io
import zipfile
import config_handler
import json
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
        level = config_handler.get_config_processor_by_framework(framework).NUMBER_OF_LEVELS
        data = FrameworkProcessor.find_all_data(framework)
        data = data[data["Level"] == level]

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
        stored_values = DataStorage()

        data = data["data"]
        data = data.replace('], ', '&&&')
        data = data.split('&&&')

        for framework_data in data:
            framework_data = framework_data.replace(': [', '&&&')
            framework_data = framework_data.split('&&&')
            framework = framework_data[0].replace('"', '')

            elements = framework_data[1].replace('}, {', '&&&')
            elements = elements.replace('{', '').replace('}]', '')
            elements = elements.split('&&&')
            for element in elements:
                name = element.split('", "')[0].replace('"Name": "', '')
                bc = element.split('", "')[1].replace('BroaderConcept": "', '')[:-1]
                stored_values.add_field({'framework': framework, 'field': name, 'foregoing': bc})

        all_data_fos = []
        all_data_skills = []

        for value in stored_values.get_stored_values_full().values():
            for data in value:
                data = data.get_all_data()

                if data['type'] == 'EducationalAlignment':
                    all_data_fos.append(data)
                else:
                    all_data_skills.append(data)

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


class DataStorage:

    def __init__(self):
        self._stored_values = dict()

    def add_field(self, value):
        framework = value['framework']
        field = value['field']
        forgoing = value['foregoing']

        entry = Entry(framework, field, forgoing)

        if framework in self._stored_values.keys():
            self._stored_values[framework].add(entry)
        else:
            self._stored_values[framework] = {entry}

    def get_stored_values(self):
        stored_values = dict()

        for key in self._stored_values.keys():
            listed_values = []
            for entry in self._stored_values[key]:
                listed_values.append(entry.get_name())
            stored_values[key] = listed_values

        return stored_values

    def get_stored_values_full(self):
        return self._stored_values

    def delete_value(self, framework, value):
        entries = self._stored_values[framework]

        entries = {entry for entry in entries if entry.get_name() != value}

        if len(entries) != 0:
            self._stored_values[framework] = entries
        else:
            del self._stored_values[framework]

    def reset_dict(self):
        self._stored_values = dict()


class Entry:

    def __init__(self, framework, value, forgoing_value):
        self._entry_values = self.generate_entry(framework, value, forgoing_value)

    def __hash__(self):
        return hash(self.get_name())

    def __eq__(self, other):
        if not isinstance(other, Entry):
            return False
        return self.get_name() == other.get_name()

    def generate_entry(self, framework, value, forgoing_value):

        config = config_handler.get_config_processor_by_framework(framework)

        path = FrameworkProcessor.find_framework_folder()
        path = os.path.join(path, framework + ".csv")

        data = pd.read_csv(path, sep=";", dtype=str)
        print(framework)
        print(value)
        print(forgoing_value)
        print(data[(data["Name"] == value) & (data["BroaderConcept"] == forgoing_value)])
        data = data[(data["Name"] == value) & (data["BroaderConcept"] == forgoing_value)].iloc[-1]  # This guarantees
        # that only one row is selected. It is always the last one. Otherwise, problems could occur if three or more
        # nodes in the path share the same name. In this case, the combination Name - BroaderConcept is ambiguous like
        # in ESCO Construction - construction - construction.

        data_block = {
            "educationalFramework": framework,
            "url": config.URL,
            "name": self.generate_names_of(value),
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

    def get_name(self):
        return self._entry_values['name'][0]['name']

    def get_all_data(self):
        return self._entry_values
