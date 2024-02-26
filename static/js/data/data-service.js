import {find_entry_by_name, process_all_fetched_frameworks} from "./data-utils.js";
import {
    show_search_results,
    show_no_search_results,
    build_web_interface
} from "../ui/ui-handler.js";
import {all_selected, frameworks_complete} from "../utils/helper.js";

export function download_all_frameworks(){
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
            get_web_interface_data();
        })
        .catch(error => {
           console.error('Fetched error: ' + error);
        });
}


export function start_search(search_field){
    const url = '/conduct_search?query=' + search_field.value;

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

function get_web_interface_data(){
    fetch('get_all_webpage_infos')
        .then(response => response.json())
        .then(data => {
            const web_interface_data = new Map();

            for (const [key, value] of Object.entries(data)){
                web_interface_data[key] = value;
            }

            return web_interface_data;
        })
        .then(web_interface_data => build_web_interface(web_interface_data));
}

export function write_json(){
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