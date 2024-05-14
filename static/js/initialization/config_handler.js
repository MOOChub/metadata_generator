import {framework_configs} from "../utils/temporary_storage.js";
import {setup_ui_all} from "../ui/ui_handler_initialization.js";


/**
 * Gets all configs for the available frameworks via a GET request from the
 * MOOChub Metadata Tool API. The received data will be stored in the central
 * storage variable framework_configs.
 */
export function get_all_configs(){
    fetch('/get_all_configs')
        .then(response => {
            if(!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            process_config(data);  // The config data needs to be pre-processed to be stored in the
                                    // frameworks_config variable.
            setup_ui_all();  // starting to build the ui after the framework configs are loaded
        })
        .catch(e => {
            console.error('Error config retrival:', e)
        });
}


/**
 * Processes the received configs and put them into the frameworks_config
 * variable.
 *
 * @param configs {Array<Object>}
 */
function process_config(configs){
    configs.forEach(config => {
        const temp = {};

        const temp_att = Object.keys(config);
        temp_att.forEach(att => { // extract all data except the ID -> ID will be the key
            if(att !== 'ID'){
                temp[att] = config[att];
            }
        });
        framework_configs.set(config['ID'], temp);
    });
}
