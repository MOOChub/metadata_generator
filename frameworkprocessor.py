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
    def find_fos_fields(path, config, level, value):
        code_length = 0
        for i in config.CHARACTERS_PER_LEVEL[:level]:
            code_length += i

        data = pd.read_csv(path, sep=config.SEPARATOR, dtype=str)
        temp = data.copy()

        data = data[data[config.COLUMN_CODE].str.len() == code_length]

        if value is not None:
            temp = temp[(temp[config.COLUMN_NAME] == value) &
                        (temp[config.COLUMN_LEVEL] == str(level - 1))][config.COLUMN_CODE].item()
            data = data[data[config.COLUMN_CODE].str.startswith(temp)]

        data = data[config.COLUMN_NAME].unique()

        fields = list(data)

        return fields

    @staticmethod
    def find_skill_fields(path, config, level, value):
        fields = []

        framework_data = pd.read_csv(path)

        framework_type = config.FRAMEWORK_LABEL

        data = framework_data.loc[framework_data["Level 0 preferred term"] == framework_type]

        if value is not None:
            data = data.loc[data["Level " + str(level - 1) + " preferred term"] == value]

        data = data["Level " + str(level) + " preferred term"].unique()

        for i in data:
            if type(i) == str:
                fields.append(i)

        fields.sort()

        return fields

    @staticmethod
    def find_fields(input_params):
        framework = input_params.get('framework')
        value = input_params.get('value')
        level = int(input_params.get('level'))

        if value == "None":
            value = None

        path = FrameworkProcessor.find_framework_folder()

        if framework == "ISCED-F":
            path = os.path.join(path, "ESCO 1.1.1.csv")
        else:
            path = os.path.join(path, framework + ".csv")

        config_framework = config_handler.get_config_processor_by_framework(framework)
        framework_type = config_framework.FRAMEWORK_PURPOSE

        if framework_type == "ESCO":
            return FrameworkProcessor.find_skill_fields(path, config_framework, level, value)
        elif framework_type == "FoS":
            return FrameworkProcessor.find_fos_fields(path, config_framework, level, value)

    @staticmethod
    def write_json(stored_values):

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

        self._stored_values[framework] = entries
        
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
        level = config.NUMBER_OF_LEVELS

        path = FrameworkProcessor.find_framework_folder()

        if framework == "ISCED-F":
            path = os.path.join(path, "ESCO 1.1.1.csv")
        else:
            path = os.path.join(path, framework + ".csv")

        data = pd.read_csv(path, sep=config.SEPARATOR, dtype=str)

        if config.FRAMEWORK_PURPOSE == "ESCO":
            data = data.loc[(data["Level " + str(level) + " preferred term"] == value) &
                            (data["Level " + str(level - 1) + " preferred term"] == forgoing_value)]
        else:
            temp = data.copy()
            temp = temp[(temp[config.COLUMN_NAME] == forgoing_value) &
                        (temp[config.COLUMN_LEVEL] == str(level - 1))][config.COLUMN_CODE].item()
            data = data.loc[(data[config.COLUMN_NAME] == value) &
                            (data[config.COLUMN_CODE].str.startswith(temp)) &
                            (data[config.COLUMN_LEVEL] == str(level))].iloc[[-1]]

        if framework == "ISCED-F":
            short_code = data['Level ' + str(level) + ' URI'].iloc[0].split("/")[-1]
        elif config.FRAMEWORK_PURPOSE == "ESCO":
            short_code = data['Level ' + str(level) + ' code'].iloc[0]
        else:
            short_code = data[config.COLUMN_CODE].item()

        if config.FRAMEWORK_PURPOSE == "ESCO":
            target_url = data['Level ' + str(level) + ' URI'].iloc[0]
            description = str(data['Description'].iloc[0]) + "\n" + str(data['Scope note'].iloc[0])
        else:
            target_url = None
            description = None

        data_block = {
            "educationalFramework": framework,
            "url": config.URL,
            "name": self.generate_names_of(value),
            "alternativeName": None,
            "shortCode": short_code,
            "targetUrl": target_url,
            "description": description,
        }

        if "ESCO" in framework:
            data_block["type"] = "Skill"
        else:
            data_block["type"] = "EducationalAlignment"
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
