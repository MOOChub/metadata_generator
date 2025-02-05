from models.entry_model import EntryModel
from flask import request, send_file
import io
import zipfile
import json


class EntryController:
    """The EntryController prepares all from the client passed entries and returns the
    selected entries as a JSON-like string or zip file. The header of the response is
    set accordingly.
    """
    def __init__(self):
        self.all_data_fos = list()
        self.all_data_skills = list()

    def write_json(self):
        """The actual processing of the received data via a POST. The JSON will be treated
        as a dictionary with the keys representing the framework and the values are lists
        of the entries selected per framework.

        :return: two JSON-like strings containing the JSON fragments for the attributes
        'teaches' and 'educationalAlignment' as defined by the MOOChub format V3
        """
        data = request.get_json()  # received data via a POST as JSON containing all selected entries

        for framework in data.keys():
            entry_model = EntryModel(framework)

            for element in data[framework]:
                name = element["Name"]
                bc = element["BroaderConcept"]

                entry = vars(entry_model.get_entry(name, bc))

                if entry['type'] == 'EducationalAlignment':
                    self.all_data_fos.append(entry)
                else:
                    self.all_data_skills.append(entry)

        return json.dumps({"Skills": self.all_data_skills, "FOS": self.all_data_fos})

    def write_zip_file(self):
        """This function returns the selected entries as a zip file. The selected
        entries are caught from a POST. The write_json function will be called
        first. This functions will write the JSON-like strings into a zip file.

        :return: a zip file containing the JSON fragments for the attributes
        'teaches' and 'educationalAlignment' as defined by the MOOChub format V3
        """
        all_data = json.loads(self.write_json())
        all_data_skills, all_data_fos = json.dumps(all_data["Skills"]), json.dumps(all_data["FOS"])
        all_data_skills, all_data_fos = all_data_skills.encode(), all_data_fos.encode()

        data_file = io.BytesIO()

        with zipfile.ZipFile(data_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            if len(all_data_skills) > 2:  # the JSON string should not be empty e.g. len = 2 -> '{}', empty dictionary
                zipf.writestr('skills.json', all_data_skills)
            if len(all_data_fos) > 2:
                zipf.writestr('fos.json', all_data_fos)

        data_file.seek(0)

        buffer = data_file
        response = send_file(buffer, mimetype='application/zip')
        response.headers['Content-Disposition'] = 'attachment; filename=download.zip'

        return data_file
