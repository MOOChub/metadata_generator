import os


def find_path_to_folder():
    return os.path.join(os.path.dirname(__file__), '../documentation/')


def get_web_page_info(about):
    with open(f'{find_path_to_folder()}{about}.html') as f:
        return f.read()
