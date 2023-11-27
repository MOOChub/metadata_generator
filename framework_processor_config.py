class OEFOS:
    URL = "https://www.data.gv.at/katalog/dataset/92750ae3-6460-3d51-92a7-b6a5dba70d3d"
    NUMBER_OF_LEVELS = 4
    CHARACTERS_PER_LEVEL = (1, 2, 1, 2)
    SEPARATOR = ';'
    COLUMN_NAME = 'Titel'
    COLUMN_CODE = 'Code'
    COLUMN_LEVEL = 'Ebene'
    FRAMEWORK_PURPOSE = "EducationalAlignment"
    FRAMEWORK_LABEL = "OEFOS"


class ESCO:
    URL = "https://esco.ec.europa.eu/en/classification/skill_main"
    NUMBER_OF_LEVELS = 3
    CHARACTERS_PER_LEVEL = None
    SEPARATOR = ";"
    COLUMN_NAME = 'Level 3 preferred term'
    COLUMN_CODE = 'Level 3 code'
    FRAMEWORK_PURPOSE = "Skill"
    FRAMEWORK_LABEL = 'ESCO Skills'


class ISCEDF:
    URL = """
    http://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-
    education-and-training-2013-detailed-field-descriptions-2015-en.pdf
    """
    NUMBER_OF_LEVELS = 3
    CHARACTERS_PER_LEVEL = None
    SEPARATOR = ";"
    COLUMN_NAME = 'Level 3 preferred term'
    COLUMN_CODE = 'Level 3 code'
    FRAMEWORK_PURPOSE = "EducationalAlignment"
    FRAMEWORK_LABEL = 'ISCED-F'


class DigComp:
    URL = """
    https://publications.jrc.ec.europa.eu/repository/handle/JRC128415
    """
    NUMBER_OF_LEVELS = 2
    CHARACTERS_PER_LEVEL = None
    SEPARATOR = ";"
    COLUMN_NAME = 'preferredLabel'
    COLUMN_CODE = None
    FRAMEWORK_PURPOSE = "Skill"
    FRAMEWORK_LABEL = 'DigComp'


class GRETA:
    URL = """
    https://publications.jrc.ec.europa.eu/repository/handle/JRC128415
    """
    NUMBER_OF_LEVELS = 3
    CHARACTERS_PER_LEVEL = None
    SEPARATOR = ";"
    COLUMN_NAME = 'Name'
    COLUMN_CODE = 'ShortCode'
    FRAMEWORK_PURPOSE = "Skill"
    FRAMEWORK_LABEL = 'GRETA'
