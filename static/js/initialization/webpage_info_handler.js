import {build_parts} from "../ui/ui_handler_initialization.js";


/**
 * Gets all infor for the webpage that are stored in separate HTML files.
 * This includes the how-to instructions as well as the imprint data,
 * funding and credits. The data is received via a GET request from the
 * MOOChub Metadata Tool API.
 */
export function get_web_interface_data(){
    fetch('/get_all_webpage_infos')
        .then(response => response.json())
        .then(data => {  // pre-processing before data is passed to the build_parts function
            const web_interface_data = new Map();

            for (const [key, value] of Object.entries(data)){
                web_interface_data[key] = value;
            }
            return web_interface_data;
        })
        .then(web_interface_data => build_parts(web_interface_data))
        .catch(e => {
            console.error('Webpage data error:', e)
        });
}
