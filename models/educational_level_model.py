from utils import config_helper, helper_functions


class EducationalLevel:

    def __init__(self, description, name, short_code, educational_framework, educational_framework_version, url,
                 target_url, entry_type):
        self.description = description
        self.name = name
        self.shortCode = short_code
        self.educationalFramework = educational_framework
        self.educationalFrameworkVersion = educational_framework_version
        self.url = url
        self.targetUrl = target_url
        self.type = entry_type


class EducationalLevelModel:

    def __init__(self, framework_name):
        self.config = config_helper.get_config_by_name(framework_name, 'config.development')
        self.framework_name = self.config['FRAMEWORK_LABEL']
        self.framework = helper_functions.find_all_data(framework_name)

    def get_educational_level(self, name, bc, level):

        data = helper_functions.extract_row(self.framework, name, bc)
        short_code = data["ShortCode"]
        name, description = helper_functions.get_data_for_level(level, short_code)

        name = helper_functions.generate_names_of(self.config["LANGUAGE"], name)

        return EducationalLevel(description, name, str(level), self.framework_name, self.config['VERSION'],
                                self.config['URL'], None, self.config['FRAMEWORK_PURPOSE'])
