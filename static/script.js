let config = null;
let all_data = null;
let retrievedData = null;

async function create_category_selection (framework){

    if (document.getElementById("a1") != null){
        document.getElementById("a1").remove();
    }

    if(framework !== "def"){

        await get_config_processor(framework);

        document.getElementById('headline-framework').textContent = framework;

        await build_expendable_tree();

    }
}

async function build_expendable_tree(){
    const framework = document.getElementById('select-framework').value;
    const framework_list = document.getElementById('framework-structure');

    remove_framework_list(framework_list);
    await ask_for_framework_entries(framework);

    let read_data = all_data.data;

    read_data = read_data.replace(/'/g, '"');
    read_data = read_data.replace(/ nan/g, null);

    read_data = JSON.parse(read_data);

    read_data.forEach(entry => {
        let name = entry["Name"];
        let level = entry["Level"];
        let bc = entry["BroaderConcept"];

        let list_element = document.createElement('li');
        list_element.className = "Level" + level + "-" + bc;
        list_element.id = name + "-" + level;

        if(level === config["NUMBER_OF_LEVELS"]){
            const checkBox = document.createElement("input");
            checkBox.type = 'checkbox';

            checkBox.onclick = function (){
                if(checkBox.checked){
                    add_field(framework, name, bc);
                } else {
                    remove_field(framework, name, bc);
                }
            }

            const label = document.createElement("label");
            label.textContent = name;

            list_element.appendChild(checkBox);
            list_element.appendChild(label);

        } else {
            const button = document.createElement('button');
            button.textContent = '+ ' + name;
            button.className = "append-button"
            button.onclick = function (){
                toggle_visibility_list(list_element);
            }
            list_element.appendChild(button);
        }

        if(level === 1){
            framework_list.appendChild(list_element);
        } else {
            let sub_list = document.getElementById('ul-' + bc + '-' + (level -1));
            if(!sub_list){
                sub_list = document.createElement('ul');
                sub_list.id = 'ul-' + bc + '-' + (level - 1);
            }
            sub_list.appendChild(list_element);
            document.getElementById(bc + '-' + (level -1)).appendChild(sub_list);
        }
    });
}

async function ask_for_framework_entries(framework){
    const url = '/get_whole_framework?framework=' + framework;

    await fetch(url)
        .then(response => {
            if(!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            all_data = data;
        })
        .catch(error => {
           console.error('Fetched error:', error);
        });
}

function toggle_visibility_list(node){
    const list = document.getElementById("ul-" + node.id);

    list.style.display = (!(list.style.display === 'block')) ? 'block' : 'none';

}

function remove_framework_list(framework_list){
    const elements = Array.from(framework_list.children);

    elements.forEach(element => {
       element.parentNode.removeChild(element);
    });
}

async function add_field(framework, field, forgoing){

    const value = {
        "framework": framework,
        "field": field,
        "foregoing": forgoing,
    };

    const url = "/add_field";
    const value_str = JSON.stringify(value);

    fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: value_str,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            find_all_selected();
        })
        .catch(error => {
            console.error('Fetched error: ' + error);
        });
}

function remove_field(framework, field_to_remove, field_category) {
    const url = "/delete_field?framework=" + encodeURIComponent(framework) +
        "&value=" + encodeURIComponent(field_to_remove) +
        "&value_category=" + encodeURIComponent(field_category);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            find_all_selected();
        })
        .catch(error => {
            console.error('Fetched error: ' + error);
        });
}

function show_all_selected_fields() {
    const div = document.getElementById('list-selected-values-container');
    const all_ols = div.querySelectorAll('ol');
    if(all_ols) {
        all_ols.forEach(function(ol){
           ol.remove();
        });
    }

    const keys = Object.keys(retrievedData);
    keys.sort();
    keys.forEach(function (key) {
        const list = document.createElement('ol');
        list.id = key;
        const list_title = document.createElement('h2');
        list_title.textContent = key;
        list.appendChild(list_title);

        const values = retrievedData[key];
        values.sort();
        values.forEach(function(entry){
            add_list_entry(list, entry);
        });
        div.appendChild(list);
    });
}

async function find_all_selected(){
    const url = '/get_all_stored_values';

    fetch(url)
        .then(response => {
            if (!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            retrievedData = data;
            console.log(retrievedData);
            show_all_selected_fields();
        })
        .catch(error => {
            console.error('Fetched error: ' + error);
        });
}

function add_list_entry(list, value) {

    const list_entry = document.createElement('li');
    const delete_button = document.createElement('button');
    delete_button.className = "DelButton";
    list_entry.className = "liEl";
    list_entry.textContent = value;

    list.appendChild(list_entry);
}

function write_json() {
    const url = '/write_json';

    fetch(url)
        .then(response => {
            if(!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Fetched error:', error);
        });

    const link_for_download = document.createElement('a');
    link_for_download.id = "a1";
    link_for_download.textContent = "If download does not start automatically, click this link.";
    link_for_download.href = "http://localhost:5000/write_json";
    if (document.getElementById("a1") != null){
        document.getElementById("a1").remove();
    }
    document.body.appendChild(link_for_download);
}

function reset(){

    const container = document.getElementById('list-selected-values-container').children;
    const entries = Array.from(container);
    entries.forEach(child => {
        child.parentNode.removeChild(child);
    });

    const url = '/reset';

    fetch(url)
        .then(response => {
            if (!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Fetched error: ' + error);
        });
}

function get_config_processor(framework) {
    const url = '/get_config?framework=' + encodeURIComponent(framework);

    fetch(url)
        .then(response => {
            if (!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            config = data;
        })
        .catch(error => {
            console.error('Fetched error: ' + error);
        });
}
