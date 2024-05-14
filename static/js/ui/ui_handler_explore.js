import {get_framework} from "../explore_frameworks/explore_frameworks_utils.js";
import {framework_configs,} from "../utils/temporary_storage.js";
import {clean_up, set_up_checked, unify_name_style} from "./ui_utils.js";
import {
    sep,
    select_or_remove_entry
} from "../utils/helper.js";


/**
 * Start function to build the ui to explore a given framework. Here, some general
 * settings are set. they are mostly based on the configuration file of the respective
 * framework. It will also start to download the framework.
 *
 * @param framework{string} - The name of the framework.
 * @returns {Promise<void>}
 */
export async function build_framework_to_explore(framework){
    const container = document.getElementById('framework-structure');

    clean_up(container);

    const framework_headline = document.getElementById('headline-framework');
    framework_headline.textContent = framework_configs.get(framework).FULL_NAME;

    if(framework_configs.get(framework).API_FRAMEWORK){
        show_externally_hosted(container, framework_configs.get(framework).API_FRAMEWORK);
    }else{
        const framework_data = await get_framework(framework);
        await create_tree(container, framework_data, framework_data);
        show_selected_path_all();
    }
}


/**
 * Creates the tree-like structure of the framework. The function will iterate through all entries and
 * their respective sub-entries. Entries with sub-entries will be represented as accordion items to be
 * collapsable. De-collapsing will show the next level beneath. The final level will be represented by
 * checkboxes.
 *
 * @param container{HTMLElement} - The container in which the HTML elements representing the entry are put.
 * @param entries{Array<Entry>} - The entries of a certain level including all sub-entries.
 * @param framework_data{Array<Entry>} - The complete entries of a defined framework.
 */
export function create_tree(container, entries, framework_data){
    const sub_container = document.createElement('div');
    sub_container.className = 'accordion';

    entries.forEach(entry => {
        let name = entry.name.replace(/(\s|\(|\)|\/|;|,)/g, '_'); // spaces and special characters in the name crashes
        // the collapse/de-collapse functionality!

        if(entry.sub_entries.length > 0){
            const item = document.createElement('div');
            item.className = "accordion-item";

            const header = document.createElement('h2');
            header.id = 'c-element' + sep + entry.name + sep + entry.level;
            header.className = "accordion-header";

            const btn = document.createElement('button');
            btn.className = "accordion-button collapsed";
            btn.type = "button";
            btn.textContent = unify_name_style(entry.name);

            btn.setAttribute("data-bs-toggle", "collapse");
            btn.setAttribute("data-bs-target", `#collapse-${name}${sep}${entry.level}`);
            btn.setAttribute("aria-expanded", "false");
            btn.setAttribute("aria-controls", `collapse-${name}${sep}${entry.level}`);

            if(entry.checked){
                show_is_checked(header);
            }

            header.appendChild(btn);
            item.appendChild(header);

            const collapse = document.createElement('div');
            collapse.id = `collapse-${name}${sep}${entry.level}`;
            collapse.className = "accordion-collapse collapse";
            collapse.setAttribute("aria-labelledby", `collapse-${name}${sep}${entry.level}`);
            collapse.setAttribute("data-bs-parent", sub_container.id);

            const body = document.createElement('div');
            body.className = "accordion-body";
            create_tree(body, entry.sub_entries, framework_data);

            collapse.appendChild(body);
            item.appendChild(collapse);

            sub_container.appendChild(item);

        } else {
            const cbox = document.createElement('input');
            cbox.type = 'checkbox';
            cbox.id = 'c-element' + sep + entry.name + sep + entry.level;

            set_up_checked(entry);

            cbox.checked = entry.checked;

            cbox.onclick = function (){
                select_or_remove_entry(entry, cbox);
                show_selected_path(cbox);
            }

            const label = document.createElement('label');
            label.textContent = unify_name_style(entry.name);

            const c_box_col = document.createElement('div');
            c_box_col.className = "col-1";
            c_box_col.appendChild(cbox);

            const label_col = document.createElement('div');
            label_col.className = "col-11";
            label_col.appendChild(label);

            const cbox_label_row = document.createElement('div');
            cbox_label_row.className = "row mb-3";

            cbox_label_row.appendChild(c_box_col);
            cbox_label_row.appendChild(label_col);

            sub_container.appendChild(cbox_label_row);
        }
    });

    container.appendChild(sub_container);
}


/**
 * Starts the presentation of selected paths. Gathers all checkboxes and
 * path them to the show_select_path function.
 */
function show_selected_path_all(){
    const cboxes = document.getElementById('framework-structure').querySelectorAll('input');

    [...cboxes].forEach(c => {
        show_selected_path(c);
    });
}


/**
 * Uses the find_accordion_item and check_if_any_boxes_selected function to find
 * the container of the passed checkbox and controls if any checkbox in this container
 * is checked. If yes the container is marked as containing at least one checked checkbox.
 * If there is a parent accordion container to the current container, it is passed
 * to the check_if_any_accordions_selected function to follow the path to the next level.
 *
 * @param cbox{HTMLElement} - The checkbox to find the container it is a child of and
 * decide if a path needs to be shown.
 */
function show_selected_path(cbox){
    const container = find_accordion_item(cbox);
    const is_any_selected = check_if_any_boxes_selected(container);

    if (is_any_selected){
        show_is_checked([...container.getElementsByClassName('accordion-header')][0]);  // Need to convert the collection into single item -> same for show_is_not_checked
    } else {
        show_is_not_checked([...container.getElementsByClassName('accordion-header')][0]);
    }

    const next_accordion = find_accordion_item(container.parentElement);

    if(next_accordion){  // only if there is a accordion container on a higher level
        check_if_any_accordions_selected(next_accordion);
    }
}


/**
 * Controls if any sub-accordion under the current accordion is selected by
 * checking the background color. If there is at least one selected sub-accordion
 * the current accordion is also set to be checked. If there is a parent accordion
 * to the current accordion the parent accordion is controlled in a recursive
 * manner.
 *
 * @param container{HTMLElement} - The accordion which is controlled if any
 * sub-accordions are checked.
 */
function check_if_any_accordions_selected(container){
    const sub_accordions = [...container.getElementsByClassName('accordion-collapse collapse')][0].getElementsByClassName('accordion-header');
    let is_checked = false;

    [...sub_accordions].forEach(a => {
        if (a.style.background === 'lightgrey'){
            is_checked = true;
        }
    });

    if (is_checked){
        show_is_checked([...container.getElementsByClassName('accordion-header')][0]);  // Need to convert the collection into single item -> same for show_is_not_checked
    } else {
        show_is_not_checked([...container.getElementsByClassName('accordion-header')][0]);
    }

    const next_accordion = find_accordion_item(container.parentElement);
    if(next_accordion){ // only if there is a parent accordion
        check_if_any_accordions_selected(next_accordion);
    }
}


/**
 * Finds the next accordion-item on the path upwards (to higher levels) in a
 * recursive manner.
 *
 * @param element - A parent of an accordion-item to look for another accordion-item
 * on a higher level.
 * @returns {*|null} - Null if there is no accordion-item on a higher level or the
 * higher accordion-item.
 */
function find_accordion_item(element){
    if (!element){
        return null;
    }
    if (element.className === 'accordion-item'){
        return element;
    }
    return find_accordion_item(element.parentElement);
}


/**
 * Controls for checked checkboxes. If there is at least one checked
 * checkbox in the container the function will return "true" otherwise
 * it will return "false".
 *
 * @param container{HTMLElement} - The container which checkboxes are to be controlled.
 * @returns {boolean} - The result if there is at least one checked checkbox.
 */
function check_if_any_boxes_selected(container){
    const cboxes = container.querySelectorAll('input');
    let is_checked = false;

    [...cboxes].forEach(c => {
        if (c.checked){
            is_checked = true;
        }
    });

    return is_checked;
}


/**
 * Shows that a passed element is checked.
 *
 * @param element{HTMLElement} - The element to be shown as checked.
 */
export function show_is_checked(element){
    element.removeEventListener('mouseleave', mouseleaveFunc);
    element.removeEventListener('mouseover', mouseoverFunc);
    element.style.background = 'lightgrey';
}


/**
 * Shows that a passed element is not checked.
 *
 * @param element{HTMLElement} - The element to be shown as not checked.
 */
function show_is_not_checked(element){
    element.addEventListener('mouseover', mouseoverFunc);
    element.addEventListener('mouseleave', mouseleaveFunc);
    element.style.background = 'transparent';
}


/**
 * Sets the mouseover function to highlight the element the
 * mouse is hovering over.
 */
function mouseoverFunc(){
    this.style.background = 'lightgrey';
}


/**
 * Sets the mouseleave function to not highlight the element
 * anymore when the mouse leaves the element.
 */
function mouseleaveFunc (){
    this.style.background = 'transparent';
}


/**
 * If the framework is not accessible locally and cannot be shown to the user,
 * a message with a link to the framework will be shown instead.
 *
 * @param container{HTMLElement} - The container that contains the presentation of
 * the framework to explore.
 * @param framework_link{string} - The link to the framework.
 */
function show_externally_hosted(container, framework_link){
    const text = document.createElement('p');
    text.textContent = "This framework is hosted externally. To explore the framework follow this link:";

    const link = document.createElement('a');
    link.textContent = `${framework_link}`;
    link.href = `${framework_link}`;

    container.appendChild(text);
    container.appendChild(link);
}
