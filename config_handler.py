import framework_processor_config


def get_config_processor_by_framework(framework):

    if framework == "OEFOS":
        return framework_processor_config.OEFOS
    elif framework == "ESCO":
        return framework_processor_config.ESCO
    elif framework == "ISCED-F":
        return framework_processor_config.ISCEDF
    elif framework == "DigComp":
        return framework_processor_config.DigComp
    elif framework == "GRETA":
        return framework_processor_config.GRETA


def get_config_processor_by_framework_as_json(framework):

    config_data = None

    if framework == "OEFOS":
        config_data = framework_processor_config.OEFOS.__dict__
    elif framework == "ESCO":
        config_data = framework_processor_config.ESCO.__dict__
    elif framework == "ISCED-F":
        config_data = framework_processor_config.ISCEDF.__dict__
    elif framework == "DigComp":
        config_data = framework_processor_config.DigComp.__dict__
    elif framework == "GRETA":
        config_data = framework_processor_config.GRETA.__dict__

    temp = dict()

    for key in config_data.keys():
        if "__" not in key:
            temp[key] = config_data[key]

    return temp
