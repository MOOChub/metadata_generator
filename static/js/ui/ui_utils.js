import {all_selected, framework_configs} from "../utils/temporary_storage.js";


/**
 * Sets all search results to block text in the representation and show all
 * search results without any limitations.
 */
export function present_all_search_results(){
    const frameworks = [...framework_configs.keys()];

    frameworks.forEach(f => {
        const text = document.getElementById(`result_text-${f}`);
        if(text){
            text.style.display = 'block';
        }
    });
}


/**
 * Shows all search results from a defined framework. The framework is given
 * as a parameter and read from the search limiters.
 *
 * @param framework{string} - The name of the framework the results are shown
 * to the user.
 */
export function present_selected_search_results(framework){
    const frameworks = [...framework_configs.keys()];

    frameworks.forEach(f => {
        const text = document.getElementById(`result_text-${f}`);
        if(text){
            if(f === framework){
                text.style.display = 'block';
            }else{
                text.style.display = 'none';
            }
        }
    });
}


/**
 * Removes all child elements from a given container.
 *
 * @param element{HTMLElement} - The container all children will be removed from.
 */
export function clean_up(element){
    Array.from(element.children).forEach(e => {
       e.parentElement.removeChild(e);
    });
}


/**
 * The names of the entries and higher categories are put in a
 * uniform style. Otherwise, the DigComp entry names, for example,
 * would be shown completely capitalized.
 *
 * @param name{string} - The name of the entry in its original style.
 * @returns {string} - The name of the entry in the uniform style.
 */
export function unify_name_style(name){
    return name[0].toUpperCase() + name.slice(1,name.length).toLowerCase();
}


/**
 * Controls if an entry is in the all_selected variable. The comparison
 * is done by the name of the entry.
 *
 * @param entry{Entry} - The entry to be checked if it is already listed in
 * the all_selected variable.
 */
export function set_up_checked(entry){
    let is_in_selected = false;

    if (all_selected.get(entry.framework)){
        all_selected.get(entry.framework).forEach(e => {
            if(entry.name === e.name){
                is_in_selected = true;
            }
        });
    }

    entry.setChecked(is_in_selected);
}
