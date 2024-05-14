import {get_all_configs} from "./initialization/config_handler.js";

function initialize(){
    get_all_configs();
}

document.addEventListener('DOMContentLoaded', initialize);
