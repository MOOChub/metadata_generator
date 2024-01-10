import config


def get_config_processor_by_framework(framework):

    if framework == "OEFOS":
        return config.OEFOS
    elif framework == "ESCO":
        return config.ESCO
    elif framework == "ISCED-F":
        return config.ISCEDF
    elif framework == "DigComp":
        return config.DigComp
    elif framework == "GRETA":
        return config.GRETA


def get_config_processor_by_framework_as_json(framework):

    config_data = None

    if framework == "OEFOS":
        config_data = config.OEFOS.__dict__
    elif framework == "ESCO":
        config_data = config.ESCO.__dict__
    elif framework == "ISCED-F":
        config_data = config.ISCEDF.__dict__
    elif framework == "DigComp":
        config_data = config.DigComp.__dict__
    elif framework == "GRETA":
        config_data = config.GRETA.__dict__

    temp = dict()

    for key in config_data.keys():
        if "__" not in key:
            temp[key] = config_data[key]

    return temp
