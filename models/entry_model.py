"""
The entry_model.py modul contains the classes to model an Entry object.

Classes:
    Entry: The Entry object stores all relevant data of an entry according to the MOOCub format V3.

    EntryModel: The EntryModel creates Entry objects according to the specification. Framework related data is gathered
    from the configuration file and the entry-specific data is extracted from the provided framework data.
"""

from utils import helper_functions, config_helper


class Entry:
    """The Entry object stores all relevant data of an entry according to the MOOCub format V3.
    """
    def __init__(self, names_list, educational_framework, url, short_code, alternative_names_list, target_url,
                 description, entry_type, educational_framework_version, educational_alignment):
        self.name = names_list
        self.educationalFramework = educational_framework
        self.url = url
        self.shortCode = str(short_code)
        self.alternateName = alternative_names_list
        self.targetUrl = target_url
        self.description = description
        self.type = entry_type
        self.educationalFrameworkVersion = educational_framework_version
        self.educationalAlignment = educational_alignment


class EntryModel:
    """The EntryModel creates Entry objects according to the specification. Framework related
    data is gathered from the configuration file and the entry-specific data is extracted from
    the provided framework data.
    """
    def __init__(self, framework_name):

        self.config = config_helper.get_config_by_name(framework_name, 'config.development')
        self.framework_name = self.config['FRAMEWORK_LABEL'] # The internal framework name is sometimes different to the
        # label! But the label
        self.framework = None

        if not self.config['API_SEARCH']:  # The following part only works with local frameworks, not APIs!
            self.framework = helper_functions.find_all_data(framework_name)

    def get_entry(self, name, bc):
        """Create an entry by name and broader concept (bc). Also consider the framework
        specified during the initialization of the EntryModel.

        :param name: the name of the entry as a string
        :param bc: the broader concept (bc) of the entry as a string
        :return: an Entry object containing all relevant data according to the MOOChub format V3
        """
        if self.framework is not None:
            data = helper_functions.extract_row(self.framework, name, bc)  # This only works for local frameworks
        else:
            data = {'ShortCode': None, 'Uri': None, 'Description': None}  # Dummy data -> TODO: Uri and Description are
            # TODO: received by the API from CoKoMO! Find a way to show them here!

        names = helper_functions.generate_names_of(self.config['LANGUAGE'], name)

        return Entry(names, self.framework_name, self.config['URL'], data['ShortCode'], None, data["Uri"],
                     data["Description"], self.config['FRAMEWORK_PURPOSE'], self.config['VERSION'],
                     self.config['ALIGNMENT_TYPE'])
