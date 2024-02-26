import {list_selected_entries} from "../data/data-utils.js";
import {frameworks_complete, mapping_full_names, sep} from "../utils/helper.js";
import {create_tree} from "./ui-handler.js";

export function clean_up(element){
    Array.from(element.children).forEach(e => {
       e.parentElement.removeChild(e);
    });
}

export function set_checked_path(entry) {
    const element = document.getElementById('c-element' + sep + entry.name + sep + entry.level);
    let isChecked = false;

    if(!element){
        entry.sub_entries.forEach(e => {
            if(e.checked){
                isChecked = true;
            }
        });
        entry.setChecked(isChecked);

    }else if(element.tagName.toLowerCase() === 'input') {
        isChecked = element.checked;
        entry.setChecked(isChecked);

        list_selected_entries(entry);
    }else{
        entry.sub_entries.forEach(e => {
            if(e.checked){
                isChecked = true;
            }
        });
        entry.setChecked(isChecked);

        if(entry.checked){
            show_is_checked(element);
        }else{
            show_is_not_checked(element);
        }
    }

    if(entry.bc){
        set_checked_path(entry.bc);
    }
}

export function show_is_checked(element){
    element.removeEventListener('mouseleave', mouseleaveFunc);
    element.removeEventListener('mouseover', mouseoverFunc);
    element.style.background = 'lightgrey';
}

function show_is_not_checked(element){
    element.addEventListener('mouseover', mouseoverFunc);
    element.addEventListener('mouseleave', mouseleaveFunc);
    element.style.background = 'transparent';
}

function mouseoverFunc(){
    this.style.background = 'lightgrey';
}

function mouseleaveFunc (){
    this.style.background = 'transparent';
}

export function present_selected_search_results(framework){
    const frameworks = [...frameworks_complete.keys()];

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

export function build_parts(web_interface_data){
    for(let name in web_interface_data){

        let content = web_interface_data[name];

        if(name !== 'names'){
            const parser = new DOMParser();
            const part_html = parser.parseFromString(content, 'text/html');
            document.getElementById(name).innerHTML = part_html.getElementById(name).innerHTML;
        }
    }
}

export function build_expendable_tree(framework_name){
    const framework_to_show = frameworks_complete.get(framework_name).top_level_entries;
    const container = document.getElementById('framework-structure');

    clean_up(container);

    const framework_headline = document.getElementById('headline-framework');
    framework_headline.textContent = mapping_full_names.get(framework_name);

    create_tree(container, framework_to_show, 0);
}

export function clean_panels(){ // Needed to avoid confusion with the checkboxes -> both, search and explor frameworks run on the same id -> seems to be the best solution, just to regenerate checkboxes everytime
    const panel_search = document.getElementById('search_results');
    clean_up(panel_search);
    const panel_frameworks = document.getElementById('framework-structure');
    clean_up(panel_frameworks);

    const framework = document.getElementById('select-framework').value;
    build_expendable_tree(framework);
}
