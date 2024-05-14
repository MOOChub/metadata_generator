import {all_selected} from "../utils/temporary_storage.js";
import {clean_up, unify_name_style} from "./ui_utils.js";
import {compare_entries_by_name} from "../utils/helper.js";


/**
 * It shows all selected entries from the all_selected variable. The
 * entries will be grouped by their frameworks and ordered alphabetically.
 */
export function show_all_selected(){
    const container = document.getElementById('list-selected-values-container');

    clean_up(container); // ensure that only relevant data is presented

    Array.from(all_selected.keys()).sort().forEach(framework => { // frameworks in alphabetical order
        const framework_title = document.createElement('h2');
        framework_title.textContent = framework;

        container.appendChild(framework_title);

        const list = document.createElement('ol');
        all_selected.get(framework).sort(compare_entries_by_name).forEach(entry => { // entries in
            // alphabetical order
            const list_element = document.createElement('li');
            list_element.textContent = unify_name_style(entry.name);

            list.appendChild(list_element);
        });
        container.appendChild(list);
    });

    document.getElementById('write_json_button').disabled = (container.children.length === 0);
    // ensure that the write_json_button is only enabled if there are entries present

    if (document.getElementById("a1")){ // removes an old download link if there is any
        document.getElementById("a1").remove();
    }
}


/**
 * This builds a download link to allow a download of the generated ZIP
 * file with the JSON files for the selected entries. This is an alternative
 * if the download does not start automatically.
 *
 * @param data{Blob} - The data blob containing the JSON fragments for
 * the entries.
 */
export function build_download_link(data){
    const link_for_download = document.createElement('a');
    link_for_download.id = "a1";
    link_for_download.textContent = "If download does not start automatically, click this link.";
    link_for_download.href = URL.createObjectURL(data);
    link_for_download.download = 'download.zip';

    if (document.getElementById("a1")){ // replace an old link if there is any
        document.getElementById("a1").remove();
    }
    link_for_download.click();
    document.getElementById('control-panel').appendChild(link_for_download);
}
