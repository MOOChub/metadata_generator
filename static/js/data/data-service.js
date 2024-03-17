import {
    process_all_fetched_frameworks,
    prepare_data_to_send,
    add_results
} from "./data-utils.js";
import {
    build_web_interface,
    build_download_link
} from "../ui/ui-handler.js";

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

export function write_json(){
    const url = '/write_json';

    const data_to_send = prepare_data_to_send();

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
            build_download_link(data);
        })
        .catch(error => {
           console.error(error);
        });
}