import os

import requests
import pandas as pd
import config_handler
import frameworkprocessor

error_log = []

url = "http://localhost:5000/add_field"
headers = {"Content-Type": "application/json"}


for file in os.listdir("frameworks"):
    path = os.path.join("frameworks", file)
    data = pd.read_csv(path, sep=";", header=0)

    framework = frameworkprocessor.FrameworkProcessor.remove_file_ending(file)
    config = config_handler.get_config_processor_by_framework(framework)

    level = config.NUMBER_OF_LEVELS

    data = data[data["Level"] == level]

    for index, row in data.iterrows():
        input_data = {
            "framework": framework,
            "field": row["Name"],
            "foregoing": row["BroaderConcept"],
        }

        try:
            response = requests.post(url, json=input_data, headers=headers)
            if response.status_code != 200:
                raise Exception()
        except:
            error_log.append(input_data)

print(error_log)
with open("error.log", 'w') as f:
    for error in error_log:
        f.write(str(error))
