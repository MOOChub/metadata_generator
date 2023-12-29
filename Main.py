from flask import Flask, request, send_file, render_template, jsonify, Markup
from frameworkprocessor import FrameworkProcessor, DataStorage
import config_handler
import search_engine

app = Flask(__name__)

stored_values = DataStorage()


@app.route('/')
def index():
    files = FrameworkProcessor.find_framework_files()
    docs = []
    with open("documentation/documentation.txt", "r") as file:
        data = file.read().split("\n")
        for i in range(3, len(data)):
            docs.append(Markup(data[i]))
            
    return render_template('index.html', files=files, documentation=docs)
           

@app.route('/load_fields')
def load_fields():
    args = request.args
    return FrameworkProcessor.find_fields(args)


@app.route('/add_field', methods=['POST'])
def add_field():
    stored_values.add_field(request.get_json())
    return jsonify({"response": "Value received!"})


@app.route('/get_all_stored_values')
def get_all_stored_values():
    return jsonify(stored_values.get_stored_values())


@app.route('/delete_field')
def delete_field():
    framework = request.args.get('framework')
    value = request.args.get('value')
    stored_values.delete_value(framework, value)

    return jsonify({"response": f"Value: {value} from framework {framework} removed!"})


@app.route('/reset')
def reset():
    stored_values.reset_dict()
    return jsonify({"reset": "true"})

'''
@app.route('/write_json')
def write_json():
    buffer = FrameworkProcessor.write_json(stored_values)
    response = send_file(buffer, mimetype='application/json')
    response.headers['Content-Disposition'] = 'attachment; filename=download.zip'

    return response
'''

@app.route('/get_config')
def get_config():
    framework = request.args.get('framework')
    return jsonify(config_handler.get_config_processor_by_framework_as_json(framework))


@app.route('/get_whole_framework')
def get_whole_framework():
    framework = request.args.get('framework')
    all_fields = FrameworkProcessor.get_all_fields(framework)

    return jsonify({"data": str(all_fields)})


@app.route('/get_all_frameworks')
def get_all_frameworks():
    return jsonify({"data": str(FrameworkProcessor.get_all_frameworks())})


@app.route('/write_json', methods=['POST'])
def write_json():
    received_fields = request.get_json()
    buffer = FrameworkProcessor.write_json(received_fields)
    response = send_file(buffer, mimetype='application/zip')
    response.headers['Content-Disposition'] = 'attachment; filename=download.zip'

    return response


@app.route('/conduct_search')
def conduct_search():
    query = request.args.get('query')
    results = search_engine.search(query)

    return jsonify({"data": str(results)})


app.run()
