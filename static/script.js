async function create_category_selection (framework, level, value){

    if (document.getElementById("a1") != null){
        document.getElementById("a1").remove();
    }

    if(framework !== "def"){

        const config = await get_config_processor(framework);

        remove_unneeded_selections(level);

        const div_id = framework + "-level" + level + "-container";

        const div = document.createElement('div');
        div.id = div_id;
        div.className = "category_selection";

        const dropdown = document.createElement('select');
        dropdown.id = framework + "-level" + level;
        dropdown.name = framework + "-level" + level;
        dropdown.className = "category_dropdown";

        build_dropdown(dropdown.id, framework, level, value);

        div.appendChild(dropdown);

        const divF = document.getElementById("SelectBox");
        divF.appendChild(div);
        dropdown.onchange = function (){
            if(level < config["NUMBER_OF_LEVELS"]){
                create_category_selection(framework, level + 1, dropdown.value);
            }
        }
    }
}

function build_dropdown(id_dropdown, framework, level, value){
    const url = "load_fields?framework=" + encodeURIComponent(framework) +
        "&level=" + encodeURIComponent(level) +
        "&value=" + encodeURIComponent(value)

    fetch(url)
        .then(response => {
            if (!response.ok){
                throw new Error("Error");
            }
            return response.json();
        })
        .then(data => {
            const def_opt = document.createElement('option');
            def_opt.text = " -- Select a value -- ";
            def_opt.value = "def";
            document.getElementById(id_dropdown).add(def_opt);

            data.forEach(function (entry) {
                add_option(id_dropdown, entry);
            });
        })
}

function add_option(id_dropdown, value){
    const option = document.createElement('option');
    option.text = value;
    option.value = value;

    document.getElementById(id_dropdown).add(option);
}

function remove_unneeded_selections (level){
    const all_divs = document.querySelectorAll("div.category_selection");
    if(all_divs){
        all_divs.forEach(function(one_selection){
            const check_level = parseInt(one_selection.id.split("level")[1]);
            if (check_level >= level){
                one_selection.remove();
            }
        });
    }
}

async function add_field() {

    await post_data();
    show_all_selected_fields();
}

async function post_data(){
    const framework = document.getElementById("select-framework").value;

    const config = await get_config_processor(framework);
    const level = config["NUMBER_OF_LEVELS"];

    const field = document.getElementById(framework + "-level" + level).value;
    const forgoing = document.getElementById(framework + "-level" + (level - 1)).value;

    const value = {
        "framework": framework,
        "field": field,
        "foregoing": forgoing,
    };

    console.log(JSON.stringify(value));
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
            show_all_selected_fields();
        })
        .catch(error => {
            console.error('Fetched error: ' + error);
        });
}

function remove_field(framework, field_to_remove, field_category) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', "/delete_field?framework=" + encodeURIComponent(framework) +
        "&value=" + encodeURIComponent(field_to_remove) + "&value_category=" +
        encodeURIComponent(field_category), true);
    xhr.send();

    show_all_selected_fields();
}

function show_all_selected_fields() {
    const div = document.getElementById('list-selected-values-container');
    const all_ols = div.querySelectorAll('ol');
    if(all_ols) {
        all_ols.forEach(function(ol){
           ol.remove();
        });
    }

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE){
            if (xhr.status === 200){
                const data = JSON.parse(xhr.responseText);
                const keys = Object.keys(data);
                keys.sort();
                keys.forEach(function (key) {
                    const list = document.createElement('ol');
                    list.id = key;
                    const list_title = document.createElement('h2');
                    list_title.textContent = key;
                    list.appendChild(list_title);

                    const values = data[key];
                    values.sort();
                    values.forEach(function(entry){
                        add_list_entry(list, entry);
                    });
                    div.appendChild(list);
                });
            }
        }
    };

    xhr.open('GET', '/get_all_stored_values', true);
    xhr.send();
}

function add_list_entry(list, value, forgoing_value) {

    const list_entry = document.createElement('li');
    const delete_button = document.createElement('button');
    delete_button.className = "DelButton";
    list_entry.className = "liEl";
    list_entry.textContent = value;
    delete_button.textContent = "Delete Entry";
    delete_button.onclick = function () {
        remove_field(list.id, value, forgoing_value);
    };

    list_entry.appendChild(delete_button);
    list.appendChild(list_entry);
}

function write_json() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/write_json', true);
    xhr.send();

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
    if (document.getElementById("ESCO 1.1.1") != null){
        document.getElementById("ESCO 1.1.1").remove();
    }
    if (document.getElementById("ISCED-F") != null){
        document.getElementById("ISCED-F").remove();
    }
    if (document.getElementById("oefos") != null){
        document.getElementById("oefos").remove();
    }
    if (document.getElementById("a1") != null){
        document.getElementById("a1").remove();
    }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/reset');
    xhr.send();
}

function get_config_processor(framework) {

    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {

                    const config = JSON.parse(xhr.responseText);
                    resolve(config);

                } else {
                    reject("Error: " + xhr.status);
                }
            }
        };
        xhr.open('GET', '/get_config?framework=' + encodeURIComponent(framework), true);
        xhr.send();
    });
}
