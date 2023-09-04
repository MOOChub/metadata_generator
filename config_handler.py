import framework_processor_config

def get_config_processor_by_framework(framework):
    if framework == "isced-f":
        return framework_processor_config.Config_isced_f
    elif framework == "oefos":
        return framework_processor_config.Config_oefos
    elif framework == "ESCO 1.1.1":
        return framework_processor_config.Config_esco_skills
    elif framework == "ISCED-F":
        return framework_processor_config.Config_isced_f_esco_knowledge

def get_config_processor_by_framework_as_json(framework):

    config_data = None

    if framework == "isced-f":
        config_data = framework_processor_config.Config_isced_f.__dict__
    elif framework == "oefos":
        config_data = framework_processor_config.Config_oefos.__dict__
    elif framework == "ESCO 1.1.1":
        config_data = framework_processor_config.Config_esco_skills.__dict__
    elif framework == "ISCED-F":
        config_data = framework_processor_config.Config_isced_f_esco_knowledge.__dict__

    temp = dict()

    for key in config_data.keys():
        if not "__" in key:
            temp[key] = config_data[key]

    return temp

