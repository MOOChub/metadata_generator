import {search_local} from "./search_local.js";
import {Entry} from "../models/entry_model.js";
import {search_results} from "../utils/temporary_storage.js";
import {search_api} from "./search_api.js";
import {show_no_search_results, show_search_results} from "../ui/ui_handler_search_results.js";


/**
 * Begin with the search. the search term is passed to the local search and the search via the available APIs.
 * Depending on if there are any research results, the results are presented or a message that no results were
 * found under the given search term.
 *
 * @param search_term{string} - The term to be searched for.
 * @returns {Promise<void>}
 */
export async function start_search(search_term){
    search_results.clear();

    const data_local = await search_local(search_term);
    await add_results(data_local);
    const data_api = await search_api("CoKoMo", search_term);  // currently, only CoKoMo is supported via API
    // access
    await add_results(data_api);

    if(search_results.size !== 0){
        show_search_results(search_results);
    }else{
        show_no_search_results();
    }
}


/**
 * Add results to the search_results map for storing and representation.
 *
 * @param results{Array} - An array containing all the result entries to be shown.
 */
function add_results(results){
    if(results){
        results.forEach(entry => {
            const framework = entry.framework;

            if(!search_results.has(framework)){
                search_results.set(framework, []);
            }

            let bc_entry = new Entry(framework, entry.bc, entry.level - 1, null, null);  // To avoid
            // problems in the representation, a pseudo broader concept entry is generated. Without it the checked path
            // cannot be set properly with the search results.

            search_results.get(framework).push(new Entry(entry.framework, entry.title,
                entry.level, bc_entry, null, null));
        });
    }
}
