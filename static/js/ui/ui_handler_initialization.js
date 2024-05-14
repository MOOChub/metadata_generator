import {clean_up, present_all_search_results, present_selected_search_results} from "./ui_utils.js";
import {get_web_interface_data} from "../initialization/webpage_info_handler.js";
import {framework_configs} from "../utils/temporary_storage.js";
import {start_search} from "../search/search_utils.js";
import {build_framework_to_explore} from "./ui_handler_explore.js";
import {clear_all_entries} from "../utils/helper.js";
import {show_all_selected} from "./ui_handler_selected.js";
import {write_json} from "../utils/write_json_handler.js";


/**
 * Initializes the UI. All necessary functions are gathered here.
 */
export function setup_ui_all(){
    setup_searchbar();
    get_web_interface_data();
    build_search_limiter();
    build_select_bar();
    setup_tabs();
    set_up_reset_button();
    set_up_write_json_button();
}


/**
 * Adds the search function to the search bar. The search is activated by pressing
 * "Enter".
 */
function setup_searchbar(){
    const search_bar = document.getElementById('search_bar');

        search_bar.addEventListener('keydown', function (event){
        if(event.key === 'Enter'){
            start_search(search_bar.value);
        }
    });
}


/**
 * Writes all fixed text data like the how-to, credits, imprint and
 * funding.
 *
 * @param web_interface_data{Map} - A Map with all fixed text information for
 * the website.
 */
export function build_parts(web_interface_data){
    for(let name in web_interface_data){
        let content = web_interface_data[name];

        const parser = new DOMParser();
        const part_html = parser.parseFromString(content, 'text/html');
        document.getElementById(name).innerHTML = part_html.getElementById(name).innerHTML;
    }
}


/**
 * Creates a set of radio buttons representing the search limiters. Which limiters
 * are set depends on the configuration file.
 */
function build_search_limiter(){
    const rd_btn = document.getElementById('search_all');

    rd_btn.onchange = function (){
        present_all_search_results();
    }

    const div = document.getElementById('search_domain_row');

    const frameworks = [...framework_configs.keys()];

    frameworks.forEach(f => {
        const radio_btn = document.createElement('input');
        radio_btn.className = 'form-check-input';
        radio_btn.type = 'radio';
        radio_btn.id = `radio_btn-${f}`;
        radio_btn.setAttribute('name', 'select_search');
        radio_btn.setAttribute('value', `select_${f}`);
        radio_btn.onchange = function (){
            present_selected_search_results(f);
        }

        const radio_label = document.createElement('label');
        radio_label.textContent = framework_configs.get(f).FRAMEWORK_LABEL;
        radio_label.className = 'me-2';
        radio_label.setAttribute('for', radio_btn.id);

        const col = document.createElement('div');
        col.className = "col-3";

        col.appendChild(radio_btn);
        col.appendChild(radio_label);

        div.appendChild(col);
    });
}


/**
 * This populates the select bar with the names of the available frameworks.
 * Which frameworks are available is determined by the configuration file.
 */
function build_select_bar(){
    const select_bar = document.getElementById('select-framework');

    const names = [...framework_configs.keys()];

    names.forEach(name => {
        const opt = document.createElement('option');
        opt.textContent = framework_configs.get(name).FRAMEWORK_LABEL;
        opt.value = name;
        select_bar.appendChild(opt);
    });

    select_bar.onchange = function (){
        build_framework_to_explore(select_bar.value);
    }
}


/**
 * This ensures that by changing the tabs between the search and the explore
 * functionality always a fresh window is shown and no old information is
 * presented.
 */
function setup_tabs(){
    const tab_search = document.getElementById('search_tab');
    const tab_explore = document.getElementById('frameworks_tab');

    tab_search.onclick = function (){
        clean_up(document.getElementById('search_results'));
    }

    tab_explore.onclick = function (){
        build_framework_to_explore(document.getElementById('select-framework').value);
    }
}


/**
 * All necessary functionalities are connected to the reset button. This includes
 * a clean-up with the removal of all entries from the temporary storage and update
 * the list shown to the user. Also, all checkboxes and the search are reset.
 */
function set_up_reset_button(){
    const reset_btn = document.getElementById('reset_button');

    reset_btn.onclick = function (){
        clear_all_entries();
        show_all_selected();
        build_framework_to_explore(document.getElementById('select-framework').value);
        clean_up(document.getElementById('search_results'));
    }
}


/**
 * The write_json_button functionality is set up here. Namely, the write_json function
 * is added to the button. Additionally, the button is disabled at the beginning, since
 * no entry can be selected right from the start.
 */
function set_up_write_json_button(){
    const write_json_btn = document.getElementById('write_json_button');
    write_json_btn.disabled = true; // when the button is set up, no entry can be selected already

    write_json_btn.onclick = function (){
        write_json();
    }
}
