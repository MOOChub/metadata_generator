import framework_processor_config


def get_config_processor_by_framework(framework):
    """
    if framework == "isced-f":
        return framework_processor_config.ConfigIsced_f
    """
    if framework == "oefos":
        return framework_processor_config.ConfigOefos
    elif framework == "ESCO 1.1.1":
        return framework_processor_config.ConfigEscoSkills
    elif framework == "ISCED-F":
        return framework_processor_config.ConfigIscedFEscoKnowledge
    elif framework == "DigComp2.2":
        return framework_processor_config.ConfigDigComp2u2


def get_config_processor_by_framework_as_json(framework):

    config_data = None
    """
    if framework == "isced-f":
        config_data = framework_processor_config.Config_isced_f.__dict__
    """
    if framework == "oefos":
        config_data = framework_processor_config.ConfigOefos.__dict__
    elif framework == "ESCO 1.1.1":
        config_data = framework_processor_config.ConfigEscoSkills.__dict__
    elif framework == "ISCED-F":
        config_data = framework_processor_config.ConfigIscedFEscoKnowledge.__dict__
    elif framework == "DigComp2.2":
        config_data = framework_processor_config.ConfigDigComp2u2.__dict__

    temp = dict()

    for key in config_data.keys():
        if "__" not in key:
            temp[key] = config_data[key]

    return temp

