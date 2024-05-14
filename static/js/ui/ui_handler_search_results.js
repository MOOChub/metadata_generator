import {
    clean_up,
    present_all_search_results,
    present_selected_search_results,
    set_up_checked,
    unify_name_style
} from "./ui_utils.js";
import {
    compare_entries_by_name,
    select_or_remove_entry,
    sep
} from "../utils/helper.js";
import {search_results} from "../utils/temporary_storage.js";


/**
 * Shows the results of a search. Eventually existing old results are removed
 * and the new results are presented. All entries are grouped by the framework
 * they belong to.
 *
 * @param results{Map} - All results received from the local search and the external
 * APIs.
 */
export function show_search_results(results){
    const results_text = document.getElementById('search_results');

    clean_up(results_text);

    const keys = [...results.keys()];
    keys.sort();  // sorted by the framework labels in alphabetical order
    keys.forEach(key => {
        const entries = search_results.get(key);

        const result_text = document.createElement('div');
        result_text.id = `result_text-${key}`;
        const headline = document.createElement('h2');
        headline.textContent = key;

        result_text.appendChild(headline);

        entries.sort(compare_entries_by_name).forEach(entry => { // also the entries within a framework
            // are ordered alphabetically
            const res_c_box = document.createElement('input');
            res_c_box.id = 'c-element' + sep + entry.name + sep + entry.level;
            res_c_box.type = 'checkbox';

            set_up_checked(entry);  // is the entry stored in the all_selected the entry attribute
            // checked is set to "true" (otherwise "false")

            res_c_box.checked = entry.checked;

            res_c_box.onclick = function () {
                select_or_remove_entry(entry, res_c_box); // clicking on the checkbox will add
                // or remove an entry to/from the all_selected
            }

            const res_row = document.createElement('div');
            res_row.className = "row mb-3";

            const res_c_box_col = document.createElement('div');
            res_c_box_col.className = "col-1";
            res_c_box_col.appendChild(res_c_box);

            const res_text = document.createElement('label')
            res_text.textContent = unify_name_style(entry.name);

            const res_text_col = document.createElement('div');
            res_text_col.className = "col-11";
            res_text_col.appendChild(res_text);

            res_row.appendChild(res_c_box_col);
            res_row.appendChild(res_text_col);

            result_text.appendChild(res_row);

            results_text.appendChild(result_text);

        });
    });

    const selected_button = document.querySelector('input[name="select_search"]:checked');

    if(!selected_button || selected_button.value === "all"){ // show results depending on the selected
        // search limiter
        present_all_search_results();
    }else{
        present_selected_search_results(selected_button.value);
    }
}


/**
 * If there are no search results, a respective message is displayed.
 */
export function show_no_search_results(){
    const container = document.getElementById('search_results');
    clean_up(container);

    const text = document.createElement('p');
    text.textContent = "Sorry! Your search did not return any results. Please, try another query.";

    container.appendChild(text);

    const framework_headline = document.getElementById('headline-framework');
    framework_headline.textContent = "Search results";
}
