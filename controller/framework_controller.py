from flask import jsonify
from models.framework_model import FrameworkModel
from utils import helper_functions
import json


class FrameworkController:
    def __init__(self):
        self.frameworks_names = helper_functions.find_framework_files()

    def get_all_frameworks(self):
        frameworks = dict()
        for framework_name in self.frameworks_names:
            framework_model = FrameworkModel(framework_name)
            frameworks[framework_name] = vars(framework_model.get_framework())

        return jsonify(json.dumps(frameworks))  # TODO: find out why json.dumps is needed here -> without there is an error in the js/client side
