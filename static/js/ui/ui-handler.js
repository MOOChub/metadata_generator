import {start_search, write_json} from "../data/data-service.js";
import {reset_selection} from "../data/data-utils.js";
import {build_parts, clean_up, set_checked_path, present_selected_search_results, show_is_checked, clean_panels, build_expendable_tree} from "./ui-utils.js";
import {compare_entries_by_name, sep, unify_name_style, frameworks_complete, all_selected} from "../utils/helper.js";

export function build_web_interface(web_interface_data){
    setup_search_bar();
    build_search_limiter();
    build_select_bar(web_interface_data);
    build_parts(web_interface_data);
    setup_framework_tab();
    setup_select_framework();
    setup_search_all();
    setup_write_json_button();
    setup_reset_button();
}

function setup_search_bar(){
    const search_bar = document.getElementById('search_bar');
    search_bar.addEventListener('keydown' , function (event){
        if(event.key === 'Enter'){
            start_search(search_bar);
        }
    });
}

function setup_reset_button(){
    const btn = document.getElementById('reset_button');

    btn.onclick = function(){
        reset_selection();
    }
}

function build_search_limiter(){
    const div = document.getElementById('search_domain_row');

    const frameworks = [...frameworks_complete.keys()];

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
        radio_label.textContent = f;
        radio_label.className = 'me-2';
        radio_label.setAttribute('for', radio_btn.id);

        const col = document.createElement('div');
        col.className = "col-3";

        col.appendChild(radio_btn);
        col.appendChild(radio_label);

        div.appendChild(col);
    });
}

function setup_search_all(){
    const rd_btn = document.getElementById('search_all');

    rd_btn.onchange = function (){
        present_all_search_results();
    }
}

function setup_write_json_button(){
    const btn = document.getElementById('write_json_button');

    btn.onclick = function(){
        write_json();
    }
}

function build_select_bar(web_interface_data){
    const select_bar = document.getElementById('select-framework');

    const names = Object.entries(web_interface_data).find(([key, value]) => key === 'names')[1];

    names.forEach(name => {
        const opt = document.createElement('option');
        opt.textContent = name;
        opt.value = name;
        select_bar.appendChild(opt);
    });
}

export function show_search_results(results){
    const results_text = document.getElementById('search_results');

    clean_up(results_text);

    results.sort(compare_entries_by_name).forEach(entry => {
        let result_text = document.getElementById(`result_text-${entry.framework}`);

        if(!result_text) {
            result_text = document.createElement('div');
            result_text.id = `result_text-${entry.framework}`;

            const headline = document.createElement('h2');
            headline.textContent = entry.framework;

            result_text.appendChild(headline);
        }

        const res_c_box = document.createElement('input');
        res_c_box.id = 'c-element' + sep + entry.name + sep + entry.level
        res_c_box.type = 'checkbox';
        res_c_box.checked = entry.checked;

        res_c_box.onclick = function () {
            set_checked_path(entry);
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

    const selected_button = document.querySelector('input[name="select_search"]:checked');

    if(!selected_button || selected_button.value === "all"){
        present_all_search_results();
    }else{
        present_selected_search_results(selected_button.value);
    }
}

export function show_no_search_results(){
    const container = document.getElementById('search_results');
    clean_up(container);

    const text = document.createElement('p');
    text.textContent = "Sorry! Your search did not return any results. Please, try another query.";

    container.appendChild(text);

    const framework_headline = document.getElementById('headline-framework');
    framework_headline.textContent = "Search results";
}

function present_all_search_results(){
    const frameworks = [...frameworks_complete.keys()];

    frameworks.forEach(f => {
        const text = document.getElementById(`result_text-${f}`);
        if(text){
            text.style.display = 'block';
        }
    });
}

export function show_all_selected(){
    const container = document.getElementById('list-selected-values-container');

    clean_up(container);

    Array.from(all_selected.keys()).sort().forEach(framework => {
        const framework_title = document.createElement('h2');
        framework_title.textContent = framework;

        container.appendChild(framework_title);

        const list = document.createElement('ol');
        all_selected.get(framework).sort(compare_entries_by_name).forEach(entry => {
            const list_element = document.createElement('li');
            list_element.textContent = unify_name_style(entry.name);

            list.appendChild(list_element);
        });
        container.appendChild(list);
    });

    document.getElementById('write_json_button').disabled = (container.children.length === 0);
}

export function create_tree(container, entries){
    const sub_container = document.createElement('div');
    sub_container.className = 'accordion';

    entries.forEach(entry => {
        let name = entry.name.replace(/(\s|\(|\)|\/|;|,)/g, '_'); // spaces and special characters in the name crashes the collapse/de-collapse functionality!

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
            create_tree(body, entry.sub_entries);

            collapse.appendChild(body);
            item.appendChild(collapse);

            sub_container.appendChild(item);

        } else {
            const cbox = document.createElement('input');
            cbox.type = 'checkbox';
            cbox.id = 'c-element' + sep + entry.name + sep + entry.level;

            cbox.checked = entry.checked;

            cbox.onclick = function (){
                set_checked_path(entry);
            };

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

function setup_framework_tab(){
    const tab = document.getElementById('frameworks_tab');

    tab.onclick = function (){
        clean_panels();
    }
}

function setup_select_framework(){
    const select = document.getElementById('select-framework');

    select.onchange = function (){
        build_expendable_tree(select.value);
    }
}

export function build_download_link(data){
    const link_for_download = document.createElement('a');
    link_for_download.id = "a1";
    link_for_download.textContent = "If download does not start automatically, click this link.";
    link_for_download.href = URL.createObjectURL(data);
    link_for_download.download = 'download.zip';

    if (document.getElementById("a1")){
        document.getElementById("a1").remove();
    }
    link_for_download.click();
    document.getElementById('control-panel').appendChild(link_for_download);
}