from flask import Flask, request, send_file, render_template, jsonify
from frameworkprocessor import FrameworkProcessor, DataStorage
import config_handler

app = Flask(__name__)

stored_values = DataStorage()


@app.route('/')
def index():
    files = FrameworkProcessor.find_framework_files()
    return render_template('index.html', files=files)


@app.route('/load_fields')
def load_fields():
    args = request.args
    return FrameworkProcessor.find_fields(args)


@app.route('/add_field', methods=['POST'])
def add_field():
    stored_values.add_field(request.get_json())
    return "Value received!"


@app.route('/get_all_stored_values')
def get_all_stored_values():
    return jsonify(stored_values.get_stored_values())


@app.route('/delete_field')
def delete_field():
    framework = request.args.get('framework')
    value = request.args.get('value')
    stored_values.delete_value(framework, value)

    return "Value: " + value + " from framework: " + framework + " removed!"


@app.route('/reset')
def reset():
    stored_values.reset_dict()
    return "true"


@app.route('/write_json')
def write_json():
    buffer = FrameworkProcessor.write_json(stored_values)
    response = send_file(buffer, mimetype='application/json')
    response.headers['Content-Disposition'] = 'attachment; filename=download.zip'

    return response


@app.route('/get_config')
def get_config():
    framework = request.args.get('framework')
    return jsonify(config_handler.get_config_processor_by_framework_as_json(framework))


app.run()
