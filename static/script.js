const frameworks_complete = new Map();
const all_selected = new Map();
const mapping_full_names = new Map();
const sep = '--';
let found = null;
const search_field = document.getElementById('search_bar');

search_field.addEventListener('keydown' , function (event){
    if(event.key === 'Enter'){
        start_search();
    }
});
download_all_frameworks();


class Entry {

    _sub_entries = [];
    constructor(framework, name, level, bc, description) {
        this._framework = framework;
        this._name = name;
        this._level = level;
        this._bc = bc;
        this._description = description;

        this._checked = false;
    }

    get framework(){
        return this._framework;
    }

    get name(){
        return this._name;
    }

    get level(){
        return this._level;
    }

    get description(){
        return this._description;
    }

    get bc(){
        return this._bc;
    }

    set bc(bc){
        this._bc = bc;
    }


    get checked(){
        return this._checked;
    }

    setChecked(isChecked){
        this._checked = isChecked;
    }

    get sub_entries(){
        return this._sub_entries;
    }

    add_sub_entry(entry){
        this._sub_entries.push(entry);
    }

    printAllData(){
        //let data = `{"Name": "${this._name}", "BroaderConcept": "${this._bc.name}", "Level": ${this._level}, "Description": "${this._description}"}`;
        return `{"Name": "${this._name}", "BroaderConcept": "${this._bc.name}"}`;

    }
}

class Framework {

    _top_level_entries = [];

    constructor(name) {
        this._name = name;
    }

    get name(){
        return this._name;
    }

    get top_level_entries(){
        return this._top_level_entries;
    }

    add_entry(entry){
        this._top_level_entries.push(entry);
    }
}

function download_all_frameworks(){
    const url = '/get_all_frameworks';

    fetch(url)
        .then(response => {
            if(!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            process_all_fetched_frameworks(data);
        })
        .catch(error => {
           console.error('Fetched error: ' + error);
        });
}

function process_all_fetched_frameworks(all_fetched_data){
    all_fetched_data = JSON.parse(all_fetched_data);

    Array.from(Object.keys(all_fetched_data)).sort().forEach(framework => {
        frameworks_complete.set(framework, create_entries(framework, all_fetched_data[framework]["fields"]));
        mapping_full_names.set(framework, all_fetched_data[framework]["full_name"]);
        //console.log(all_fetched_data[framework]["full_name"]);
    });
    //console.log(mapping_full_names);
}

function create_entries(framework_name, framework_data){
    const frameworkInstance = new Framework(framework_name);

    framework_data.forEach(element => {
        let entry = new Entry(framework_name, element['Name'], element['Level'], element['BroaderConcept'], element['Description']);

        if(entry.level === 1){
            frameworkInstance.add_entry(entry);
        } else{
            iterate_through_framework(entry, frameworkInstance.top_level_entries);
        }
    });

    return frameworkInstance;
}

function iterate_through_framework(entry, forgoing_entries){
    forgoing_entries.forEach(forgoing => {
        if(entry.bc === forgoing.name && entry.level === (forgoing.level + 1)){
            entry.bc = forgoing;
            forgoing.add_sub_entry(entry);
        } else {
            iterate_through_framework(entry, forgoing.sub_entries);
        }
    });
}

function clean_up(element){
    Array.from(element.children).forEach(e => {
       e.parentElement.removeChild(e);
    });
}

function clean_panels(){ // Needed to avoid confusion with the checkboxes -> both, search and explor frameworks run on the same id -> seems to be the best solution, just to regenerate checkboxes everytime
    const panel_search = document.getElementById('search_results');
    clean_up(panel_search);
    const panel_frameworks = document.getElementById('framework-structure');
    clean_up(panel_frameworks);

    const framework = document.getElementById('select-framework').value;
    build_expendable_tree(framework);

}

function build_expendable_tree(framework_name, showsSearch){
    const framework_to_show = frameworks_complete.get(framework_name).top_level_entries;
    const container = document.getElementById('framework-structure');

    clean_up(container);

    const framework_headline = document.getElementById('headline-framework');
    framework_headline.textContent = mapping_full_names.get(framework_name);

    create_tree(container, framework_to_show, 0, showsSearch);
}

function create_tree(container, entries, counter, showSearch){
    const sub_container = document.createElement('div');
    sub_container.id = `sub_container${sep}${counter}`;
    sub_container.className = 'accordion';

    entries.forEach(entry => {
        let name = entry.name.replace(/(\s|\(|\)|\/|;|,)/g, '_'); // spaces and special characters in the name crashes the collapse/de-collapse functionality!

        if(entry.sub_entries.length > 0){
            counter++;

            const item = document.createElement('div');
            item.className = "accordion-item";

            const header = document.createElement('h2');
            header.id = 'c-element' + sep + entry.name + sep + entry.level;
            header.className = "accordion-header";

            const btn = document.createElement('button');
            btn.className = "accordion-button collapsed";
            btn.type = "button";
            btn.textContent = entry.name;

            btn.setAttribute("data-bs-toggle", "collapse");
            btn.setAttribute("data-bs-target", `#collapse-${name}${sep}${entry.level}`);
            btn.setAttribute("aria-expanded", "false");
            btn.setAttribute("aria-controls", `collapse-${name}${sep}${entry.level}`);

            if(entry.checked){
                show_is_checked(header);
            }

            header.appendChild(btn);
            item.appendChild(header);

            const collapse = document.createElement('div');
            collapse.id = `collapse-${name}${sep}${entry.level}`;
            collapse.className = "accordion-collapse collapse";
            collapse.setAttribute("aria-labelledby", `collapse-${name}${sep}${entry.level}`);
            collapse.setAttribute("data-bs-parent", sub_container.id);

            const body = document.createElement('div');
            body.className = "accordion-body";
            create_tree(body, entry.sub_entries, counter, showSearch);

            collapse.appendChild(body);
            item.appendChild(collapse);

            sub_container.appendChild(item);

        } else {
            const cbox = document.createElement('input');
            cbox.type = 'checkbox';
            cbox.id = 'c-element' + sep + entry.name + sep + entry.level;

            cbox.checked = entry.checked;

            cbox.onclick = function (){
                set_checked_path(entry);
            };

            const label = document.createElement('label');
            label.textContent = entry.name;

            const cbox_and_label = document.createElement('div');
            cbox_and_label.appendChild(cbox);
            cbox_and_label.appendChild(label);
            sub_container.appendChild(cbox_and_label);
        }

    });

    container.appendChild(sub_container);

}

function mouseoverFunc(){
    this.style.background = 'lightgrey';
}

function mouseleaveFunc (){
    this.style.background = 'transparent';
}

function set_checked_path(entry) {
    const element = document.getElementById('c-element' + sep + entry.name + sep + entry.level);
    let isChecked = false;

    if(!element){
        entry.sub_entries.forEach(e => {
            if(e.checked){
                isChecked = true;
            }
        });
        entry.setChecked(isChecked);

    }else if(element.tagName.toLowerCase() === 'input') {
        isChecked = element.checked;
        entry.setChecked(isChecked);

        list_selected_entries(entry);
    }else{
        entry.sub_entries.forEach(e => {
            if(e.checked){
                isChecked = true;
            }
        });
        entry.setChecked(isChecked);

        if(entry.checked){
            show_is_checked(element);
        }else{
            show_is_not_checked(element);
        }
    }

    if(entry.bc){
        set_checked_path(entry.bc);
    }
}

function show_is_checked(element){
    element.removeEventListener('mouseleave', mouseleaveFunc);
    element.removeEventListener('mouseover', mouseoverFunc);
    element.style.background = 'lightgrey';
}

function show_is_not_checked(element){
    element.addEventListener('mouseover', mouseoverFunc);
    element.addEventListener('mouseleave', mouseleaveFunc);
    element.style.background = 'transparent';
}

function list_selected_entries(entry){
    const framework_name = entry.framework;

    if(entry.checked){
        if(!all_selected.get(framework_name)){
            all_selected.set(framework_name, []);
        }

        all_selected.get(framework_name).push(entry);
    }else {
        const index_to_remove = all_selected.get(framework_name).indexOf(entry);
        all_selected.get(framework_name).splice(index_to_remove, 1);

        if(all_selected.get(framework_name).length === 0){ // otherwise the name of the framework does not disappear in the selected entries section upon deselecting the last remaining entry of that framework
            all_selected.delete(framework_name);
        }
    }
    show_all_selected();
}

function show_all_selected(){
    const container = document.getElementById('list-selected-values-container');

    clean_up(container);

    Array.from(all_selected.keys()).sort().forEach(framework => {
        const framework_title = document.createElement('h2');
        framework_title.textContent = framework;

        container.appendChild(framework_title);

        const list = document.createElement('ol');
        all_selected.get(framework).sort(compare_entries_by_name).forEach(entry => {
            const list_element = document.createElement('li');
            list_element.textContent = entry.name;

            list.appendChild(list_element);
        });
        container.appendChild(list);
    });

    document.getElementById('write_json_button').disabled = (container.children.length === 0);
}

function compare_entries_by_name(entry1, entry2){
    const name1 = entry1.name.toUpperCase();
    const name2 = entry2.name.toUpperCase();

    if(name1 < name2){
        return -1;
    }
    if(name1 > name2){
        return 1;
    }
    return 0;
}

function reset_selection(){
    const link = document.getElementById('a1');
    if(link){
        link.remove();
    }

    Array.from(all_selected.keys()).forEach(f => {
        all_selected.get(f).forEach(e => {
            uncheck_path(e);
        });
    });

    all_selected.clear();
    const framework = document.getElementById('select-framework').value;
    build_expendable_tree(framework, false);
    show_all_selected();
}

function uncheck_path(entry){
    entry.setChecked(false);
    if(entry.bc){
        uncheck_path(entry.bc);
    }
}

function write_json(){
    const url = '/write_json';

    let data_to_send = '';

    for(const [key, value] of all_selected){ // converting the map with the array of entries (objects!) into a JSON-like string.
        let temp = '[';
        for(const e of value){
            temp += e.printAllData() + ', ';
        }

        temp = temp.slice(0,-2);
        temp += ']';

        data_to_send += `"${key}": ${temp}, `;
    }
    data_to_send = data_to_send.slice(0,-2);
    data_to_send = data_to_send.replace(/'/g, '"');
    data_to_send = JSON.parse(`{${data_to_send}}`); // parsing the JSON-like string into a JSON object for sending

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data_to_send),
    })
        .then(response => {
            if(!response.ok){
                throw new Error('Error: ' + response.status);
            }
            return response.blob();
        })
        .then(data => {
            const link_for_download = document.createElement('a');
            link_for_download.id = "a1";
            link_for_download.textContent = "If download does not start automatically, click this link.";
            link_for_download.href = URL.createObjectURL(data);
            link_for_download.download = 'download.zip';

            if (document.getElementById("a1")){
                document.getElementById("a1").remove();
            }
            link_for_download.click();
            document.getElementById('control-panel').appendChild(link_for_download);
        })
        .catch(error => {
           console.error(error);
        });
}

function start_search(){
    conduct_search(search_field.value);
}

function conduct_search(query){
    const url = '/conduct_search?query=' + query;

    fetch(url)
        .then(response => {
            if (!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            add_results(data);
        })
        .catch(error => {
            console.error('Fetched error: ' + error);
        });
}

function add_results(results){
    const results_name = 'Search results';

    frameworks_complete.set(results_name, new Framework(results_name));

    results = JSON.parse(results);
    const temp= [];

    if(results["results"]){
        results["results"].forEach(result => {
            const framework = result["framework"];
            const name = result["title"];

            const entry = find_entry_by_name(name, frameworks_complete.get(framework).top_level_entries);
            found = null;
            frameworks_complete.get(results_name).top_level_entries.push(entry);
            temp.push(entry);
        });
        //build_expendable_tree(results_name, true);
        show_search_results(temp);
    } else {
        show_no_search_results();
    }
}

function find_entry_by_name(name, entries){
    for(const entry of entries){
        if(name === entry.name && entry.sub_entries.length === 0){
            found = entry;
        }else {
            find_entry_by_name(name, entry.sub_entries);
        }
    }

    return found;
}

function show_search_results(results){
    const results_text = document.getElementById('search_results');

    clean_up(results_text);

    results.forEach(entry => {
        let result_text = document.getElementById(`result_text-${entry.framework}`);

        if(!result_text) {
            result_text = document.createElement('div');
            result_text.id = `result_text-${entry.framework}`;

            const headline = document.createElement('h2');
            headline.textContent = entry.framework;

            result_text.appendChild(headline);
        }

        const res_c_box = document.createElement('input');
        res_c_box.id = 'c-element' + sep + entry.name + sep + entry.level
        res_c_box.type = 'checkbox';
        res_c_box.checked = entry.checked;

        res_c_box.onclick = function () {
            set_checked_path(entry);
        }

        const res_text = document.createElement('label')
        res_text.textContent = entry.name;

        const res_text_c_box = document.createElement('div');
        res_text_c_box.appendChild(res_c_box);
        res_text_c_box.appendChild(res_text);

        result_text.appendChild(res_text_c_box);


        results_text.appendChild(result_text);
    });

}

function show_no_search_results(){

    const container = document.getElementById('framework-structure');
    clean_up(container);

    const text = document.createElement('p');
    text.textContent = "Sorry! Your search did not return any results. Please, try another query.";

    container.appendChild(text);

    const framework_headline = document.getElementById('headline-framework');
    framework_headline.textContent = "Search results";
}