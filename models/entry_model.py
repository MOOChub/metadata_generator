import pandas as pd
import numpy as np
from utils import helper_functions


class Entry:
    def __init__(self, names_list, educational_framework, url, short_code, alternative_names_list, target_url,
                 description, entry_type, educational_framework_version, educational_alignment):
        self.name = names_list
        self.educationalFramework = educational_framework
        self.url = url
        self.shortCode = short_code
        self.alternativeName = alternative_names_list
        self.targetUrl = target_url
        self.description = description
        self.type = entry_type
        self.educationalFrameworkVersion = educational_framework_version
        self.educationalAlignment = educational_alignment


class FrameworkModel:
    def __init__(self, framework):
        self.framework = helper_functions.get_all_fields(framework)

    def get_all_fields(self):
        return self.framework
