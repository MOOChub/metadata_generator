from utils import helper_functions


class Framework:
    def __init__(self, fields, full_name):
        self.fields = fields
        self.fullName = full_name


class FrameworkModel:
    def __init__(self, framework):
        self.fields = helper_functions.get_all_fields(framework)
        self.full_name = helper_functions.get_config_of(framework).FULL_NAME

    def get_framework(self):
        return Framework(self.fields, self.full_name)
