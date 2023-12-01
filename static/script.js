let config = null;
let all_data = null;
let retrievedData = null;
const separator = '--';

function mouseoverFunc(){
    this.style.background = 'lightgrey';
}

function mouseleaveFunc (){
    this.style.background = 'transparent';
}

async function create_category_selection (framework){

    if (document.getElementById("a1") != null){
        document.getElementById("a1").remove();
    }

    if(framework !== "def"){

        await get_config_processor(framework);

        document.getElementById('headline-framework').textContent = framework;

        await build_expendable_tree();

        show_all_selected_fields();

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
        list_element.className = "Level" + level + separator + bc;
        list_element.id = name + separator + level;

        if(level === config["NUMBER_OF_LEVELS"]){
            const checkBox = document.createElement("input");
            checkBox.type = 'checkbox';

            checkBox.onclick = function (){
                if(checkBox.checked){
                    add_field(framework, name, bc);
                } else {
                    remove_field(framework, name);
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
            let sub_list = document.getElementById('ul' + separator + bc + separator + (level -1));
            if(!sub_list){
                sub_list = document.createElement('ul');
                sub_list.id = 'ul' + separator + bc + separator + (level - 1);
            }
            sub_list.appendChild(list_element);
            document.getElementById(bc + separator + (level -1)).appendChild(sub_list);
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
    const list = document.getElementById("ul" + separator + node.id);

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

function remove_field(framework, field_to_remove) {
    const url = "/delete_field?framework=" + encodeURIComponent(framework) +
        "&value=" + encodeURIComponent(field_to_remove);

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
    const elements_to_remove = div.querySelectorAll('ol');
    if(elements_to_remove) {
        elements_to_remove.forEach(function(element){
           element.parentNode.removeChild(element);
        });
    }

    const buttons = document.getElementById('framework-structure').querySelectorAll('button');
    if(buttons){
        buttons.forEach(function (button){
           button.style.background = 'transparent';
           button.addEventListener('mouseover', mouseoverFunc);
           button.addEventListener('mouseleave', mouseleaveFunc);
        });
    }

    const cboxes = document.getElementById('framework-structure').querySelectorAll('input');
    if (cboxes){
        cboxes.forEach(function (cbox){
            cbox.checked = false;
        });
    }

    const link = document.getElementById('a1');
    if(link){
        link.remove();
    }

    if(retrievedData) {
        const keys = Object.keys(retrievedData);
        document.getElementById('write_json_button').disabled = keys.length === 0;

        keys.sort();
        keys.forEach(function (key) {
            const list = document.createElement('ol');
            list.id = key;
            const list_title = document.createElement('h2');
            list_title.textContent = key;
            list.appendChild(list_title);

            const values = retrievedData[key];
            values.sort();
            values.forEach(function (entry) {
                add_list_entry(list, entry);

                mark_selected_chbox(entry);
                mark_selected_broader_concepts(entry);
            });
            div.appendChild(list);
        });
    } else {
        document.getElementById('write_json_button').disabled = true;
    }
}

function mark_selected_chbox(entry){

    const level = config["NUMBER_OF_LEVELS"];
    const entry_element = document.getElementById(entry + separator + level);

    if(entry_element){
        Array.from(entry_element.children)[0].checked = true;
    }
}

function mark_selected_broader_concepts(entry){

    let level = config["NUMBER_OF_LEVELS"];

    while (level > 1){
        let entry_element = document.getElementById(entry + separator + level);
        if(entry_element) {
            const bcName = entry_element.className.split(separator)[1];
            const bcElement = document.getElementById(bcName + separator + (level - 1));
            const button = Array.from(bcElement.children)[0];
            button.style.background = 'lightgray';
            button.removeEventListener('mouseover', mouseoverFunc);
            button.removeEventListener('mouseleave', mouseleaveFunc);
            entry = bcName;
        }
        level--;
    }
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
            show_all_selected_fields();
        })
        .catch(error => {
            console.error('Fetched error: ' + error);
        });
}

function add_list_entry(list, value) {

    const list_entry = document.createElement('li');
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
    //document.body.appendChild(link_for_download);
    document.getElementById('row-1').appendChild(link_for_download);
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
            find_all_selected();
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
