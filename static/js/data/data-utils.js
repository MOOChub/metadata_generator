import {all_selected, frameworks_complete, mapping_full_names} from "../utils/helper.js";
import {show_all_selected, show_no_search_results, show_search_results} from "../ui/ui-handler.js";
import {build_expendable_tree} from "../ui/ui-utils.js";
import {Entry, Framework} from "./data-models.js";

export function find_entry_by_name(name, all_framework_entries, found_entries){
    for(const entry of all_framework_entries){
        if(name === entry.name && entry.sub_entries.length === 0){
            found_entries.push(entry);
            break;
        }else {
            find_entry_by_name(name, entry.sub_entries, found_entries);
        }
    }
}

export function list_selected_entries(entry){
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

export function process_all_fetched_frameworks(all_fetched_data){
    all_fetched_data = JSON.parse(all_fetched_data);

    Array.from(Object.keys(all_fetched_data)).sort().forEach(framework => {
        frameworks_complete.set(framework, create_entries(framework, all_fetched_data[framework]["fields"]));
        mapping_full_names.set(framework, all_fetched_data[framework]["full_name"]);
    });
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

function uncheck_path(entry){
    entry.setChecked(false);
    if(entry.bc){
        uncheck_path(entry.bc);
    }
}

export function reset_selection(){
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
    build_expendable_tree(framework);
    show_all_selected();
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

export function prepare_data_to_send(){
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
    return JSON.parse(`{${data_to_send}}`); // parsing the JSON-like string into a JSON object for sending
}

export function add_results(results){
    results = JSON.parse(results);
    const entries = [];

    if(results["results"]){
        results["results"].forEach(result => {
            const framework = result["framework"];
            const name = result["title"];

            find_entry_by_name(name, frameworks_complete.get(framework).top_level_entries, entries);
        });
        show_search_results(entries);
    } else {
        show_no_search_results();
    }
}