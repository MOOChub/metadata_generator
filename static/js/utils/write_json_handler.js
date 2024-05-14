import {all_selected} from "./temporary_storage.js";
import {build_download_link} from "../ui/ui_handler_selected.js";


/**
 * This function contacts the endpoint to create the ZIP file containing the JSON file(s) with the selected entries.
 */
export function write_json(){
    const url = '/write_json';

    const data_to_send = prepare_data_to_send();

    fetch(url,{
        method: 'POST',
        headers: {
            'content-Type': 'application/json',
        },
        body: JSON.stringify(data_to_send),  // For still unknown reasons it is necessary the JSON.parse object to
        // convert back with stringify here; only passing the string from prepare_data_to_send does not work
        // (400 bad request)
    })
        .then(response => {
            if(!response.ok){
                throw new Error('Error');
            }
            return response.blob();
        })
        .then(data => {
            build_download_link(data);
        })
        .catch(e => {
            console.error('Write JSON error:', e);
        });
}


/**
 * Takes all selected entries from the all_selected variable and generates the JSON to be sent to the endpoint.
 *
 * @returns {any} - A JSON containing all selected entries.
 */
function prepare_data_to_send(){
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
