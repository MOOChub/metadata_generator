class Config_oefos:
    URL = "https://www.data.gv.at/katalog/dataset/92750ae3-6460-3d51-92a7-b6a5dba70d3d"
    NUMBER_OF_LEVELS = 4
    CHARACTERS_PER_LEVEL = (1,2,1,2)
    SEPARATOR = ';'
    COLUMN_NAME = 'Titel'
    COLUMN_CODE = 'Code'
    COLUMN_LEVEL = 'Ebene'
    FRAMEWORK_PURPOSE = "FoS"
    FRAMEWORK_LABEL = "OEFOS"

class Config_esco_skills:
    URL = "https://esco.ec.europa.eu/en/classification/skill_main"
    NUMBER_OF_LEVELS = 3
    CHARACTERS_PER_LEVEL = None
    SEPARATOR = ","
    COLUMN_NAME = 'Level 3 preferred term'
    COLUMN_CODE = 'Level 3 code'
    FRAMEWORK_PURPOSE = "ESCO"
    FRAMEWORK_LABEL = 'skills'

class Config_isced_f_esco_knowledge:
    URL = "http://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf"
    NUMBER_OF_LEVELS = 3
    CHARACTERS_PER_LEVEL = None
    SEPARATOR = ","
    COLUMN_NAME = 'Level 3 preferred term'
    COLUMN_CODE = 'Level 3 code'
    FRAMEWORK_PURPOSE = "ESCO"
    FRAMEWORK_LABEL = 'knowledge'
