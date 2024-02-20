from utils import helper_functions


class Entry:
    def __init__(self, names_list, educational_framework, url, short_code, alternative_names_list, target_url,
                 description, entry_type, educational_framework_version, educational_alignment):
        self.name = names_list
        self.educationalFramework = educational_framework
        self.url = url
        self.shortCode = str(short_code)
        self.alternativeName = alternative_names_list
        self.targetUrl = target_url
        self.description = description
        self.type = entry_type
        self.educationalFrameworkVersion = educational_framework_version
        self.educationalAlignment = educational_alignment


class EntryModel:
    def __init__(self, framework_name):
        self.framework_name = framework_name
        self.framework = helper_functions.find_all_data(framework_name)
        self.config = helper_functions.get_config_of(framework_name)

    def get_entry(self, name, bc):
        data = helper_functions.extract_row(self.framework, name, bc)

        names = helper_functions.generate_names_of(self.config.LANGUAGE, name)

        return Entry(names, self.framework_name, self.config.URL, data['ShortCode'], None, data["Uri"],
                     data["Description"], self.config.FRAMEWORK_PURPOSE, self.config.VERSION,
                     self.config.ALIGNMENT_TYPE)
