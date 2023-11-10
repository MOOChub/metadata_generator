import requests
import pandas as pd

error_log = []

url = "http://localhost:5000/add_field"
headers = {"Content-Type": "application/json"}

frameworks = ["knowledge", "skill", "oefos"]
names = ["ISCED-F", "ESCO 1.1.1", "oefos"]
files = ["ESCO 1.1.1", "oefos"]

for i in range(len(frameworks)):
    framework = frameworks[i]
    name = names[i]
    if framework == frameworks[2]:
        data_sep = ';'
        file = files[1]
    else:
        data_sep = ','
        file = files[0]

    path = "frameworks/" + file + ".csv"

    data = pd.read_csv(path, sep=data_sep, dtype=str)

    if file == files[0]:
        data = data[data['Level 0 preferred term'] == framework]
        data = data[data['Level 3 preferred term'].notna()]

        for index, row in data.iterrows():
            data1 = row['Level 3 preferred term']
            data2 = row['Level 2 preferred term']

            input_data = {
                "framework": name,
                "field": data1,
                "foregoing": data2
            }

            try:
                response = requests.post(url, json=input_data, headers=headers)
                if response.status_code != 200:
                    raise Exception()

            except:
                error_log.append(input_data)
    else:
        temp = data.copy()
        data = data[data['Ebene'] == "4"]
        temp = temp[temp['Ebene'] == "3"]

        for index, row in data.iterrows():
            data1 = row['Titel']
            forgoing_code = row['Code'][:-2]
            data2 = temp[temp['Code'] == forgoing_code]['Titel'].item()

            input_data = {
                "framework": name,
                "field": data1,
                "foregoing": data2
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
