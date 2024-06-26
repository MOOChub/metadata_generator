import datetime

today = datetime.datetime.now()


class OEFOS:
    ID = "OEFOS"
    FULL_NAME = "Österreichische Systematik der Wissenschaftszweige"
    URL = "https://www.data.gv.at/katalog/dataset/92750ae3-6460-3d51-92a7-b6a5dba70d3d"
    FRAMEWORK_PURPOSE = "EducationalAlignment"
    FRAMEWORK_LABEL = "OEFOS"
    LANGUAGE = "EN"
    VERSION = "2012"
    ALIGNMENT_TYPE = "educationalSubject"
    API_FRAMEWORK = None
    API_SEARCH = None
    LOCAL = False


class ESCO:
    ID = "ESCO"
    FULL_NAME = "European Skills, Competences and Occupations"
    URL = "https://esco.ec.europa.eu/en/classification/skill_main"
    FRAMEWORK_PURPOSE = "Skill"
    FRAMEWORK_LABEL = 'ESCO Skills'
    LANGUAGE = "EN"
    VERSION = "1.1.1"
    ALIGNMENT_TYPE = None
    API_FRAMEWORK = None
    API_SEARCH = None
    LOCAL = False


class ISCEDF:
    ID = "ISCEDF"
    FULL_NAME = "International Standard Classification of Education - Fields"
    URL = "http://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf"""
    FRAMEWORK_PURPOSE = "EducationalAlignment"
    FRAMEWORK_LABEL = 'ISCED-F'
    LANGUAGE = "EN"
    VERSION = "2013"
    ALIGNMENT_TYPE = "educationalSubject"
    API_FRAMEWORK = None
    API_SEARCH = None
    LOCAL = False


class DigComp:
    ID = "DigComp"
    FULL_NAME = "Digital Competence Framework for Citizens"
    URL = "https://publications.jrc.ec.europa.eu/repository/handle/JRC128415"
    FRAMEWORK_PURPOSE = "Skill"
    FRAMEWORK_LABEL = 'DigComp'
    LANGUAGE = "EN"
    VERSION = "2.2"
    ALIGNMENT_TYPE = None
    API_FRAMEWORK = None
    API_SEARCH = None
    LOCAL = False


class CoKoMo:
    ID = "CoKoMo"
    FULL_NAME = "Conceptual Knowledge Model"
    URL = "https://cokomo.code4you.com"
    FRAMEWORK_PURPOSE = "Skill"
    FRAMEWORK_LABEL = 'CoKoMo'
    LANGUAGE = "DE"
    VERSION = f"{today.year}-{today.month}"
    ALIGNMENT_TYPE = None
    API_FRAMEWORK = "https://cokomo.code4you.com"
    API_SEARCH = 'https://cokomo-publicapi.code4you.com/CompetenceBase/hpi/'
    LOCAL = True


class GRETA:
    ID = 'GRETA'
    FULL_NAME = "Grundlagen für die Entwicklung eines trägerübergreifenden Anerkennungsverfahrens von Kompetenzen Lehrender in der Erwachsenen- und Weiterbildung"
    URL = "https://publications.jrc.ec.europa.eu/repository/handle/JRC128415"
    FRAMEWORK_PURPOSE = "Skill"
    FRAMEWORK_LABEL = 'GRETA'
    LANGUAGE = "DE"
    VERSION = "2.0"
    ALIGNMENT_TYPE = None
    API_FRAMEWORK = None
    API_SEARCH = None
