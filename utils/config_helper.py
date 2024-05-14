"""
The config_helper.py modul contains the helper method for processing the configuration files.

The configuration exists as classes in a separate .py file and need processing to be read.

Methods:
    get_config_by_name(config_framework_name, config_module='config.development'): Get a specific configuration by the
    name of a framework.

    remove_unnecessary_config_information(config_object): Load the configuration as a dictionary and remove all
    unnecessary information from the dictionary.

    list_all_configs(): List all configuration names available in the defined module.

    get_all_configs(): Get all frameworks as a list of the cleaned dictionaries of all available configurations.
"""

import importlib
import inspect
from config import development  # TODO: can this be set in the __init__ of config?


def get_config_by_name(config_framework_name, config_module='config.development'):
    """Get a specific configuration by the name of a framework.

    :param config_framework_name: The name of the framework of which the config is loaded
    :param config_module: The config module which is used for gathering the configs
    :return: A dictionary with the necessary config data
    """
    module = importlib.import_module(config_module)
    config_object = getattr(module, config_framework_name)  # TODO: ISCED-F is not the class name but the ID...
    return remove_unnecessary_config_information(config_object)


def remove_unnecessary_config_information(config_object):
    """Load the configuration as a dictionary and remove all unnecessary information from the dictionary.

    :param config_object: The object that contains the config information of a single framework
    :return: A cleaned dictionary only containing the relevant information for further processing
    """
    config_data = config_object.__dict__
    unneeded_attributes = {'__module__', '__dict__', '__weakref__', '__doc__'}  # Part of the object but not needed in
    # further processing
    return {key: value for key, value in config_data.items() if key not in unneeded_attributes}


def list_all_configs():
    """List all configuration names available in the defined module.

    :return: A list with all config names
    """
    all_configs = list()
    for a1, a2 in inspect.getmembers(development):  # TODO: need solution for module to be looked into
        if inspect.isclass(a2):
            all_configs.append(a1)

    return all_configs


def get_all_configs():
    """Get all frameworks as a list of the cleaned dictionaries of all available configurations.

    :return: A list containing all available configuration information as cleaned dictionaries
    """
    all_configs = list()
    for name, conf_obj in inspect.getmembers(development):  # TODO: need solution for module to be looked into
        if inspect.isclass(conf_obj):
            all_configs.append(remove_unnecessary_config_information(conf_obj))
    return all_configs
