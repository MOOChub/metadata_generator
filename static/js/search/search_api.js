import {framework_configs} from "../utils/temporary_storage.js";


/**
 * Searches for a competency or field of study term within a framework. The
 * framework is contacted by a GET request against its API.
 *
 * @param framework - The name of the framework. It is used to identify the correct link
 * to the API within the configuration file.
 * @param search_term - The term for which is queried.
 * @returns {Promise<null>} - A JSON object containing the basic information for displaying
 * the results as entries (or "null" if nor result is found).
 */
export async function search_api(framework, search_term){
    const url = framework_configs.get(framework).API_SEARCH;

    let res_data = null;

    if(search_term.length > 4){
        await fetch(url + search_term)
            .then(response => {
                if(!response.ok){
                    throw new Error('Error');
                }
                return response.json();
            })
            .then(data => {
                res_data = preprocess_data(framework, data);  // Preprocessing is necessary because the delivered data
                //from the queried API is not in the correct format.
            })
            .catch(e => {
                console.error(`Error api ${framework} search:`, e);
            });
    }

    return res_data;
}


/**
 * Processes the data prior to being passed to the next function. The results are
 * converted into an array of JSON objects representing an entry each.
 *
 * @param framework{string} - The name of the framework.
 * @param data{Array<Object>} - An array of objects representing the search results.
 * @returns {*[]} - An array of the processes results to be used in the presentations
 * of the entries.
 */
function preprocess_data(framework, data){
    const results = [];

    data.forEach(entry => {
        const temp = {
            "framework": framework,
            "title": entry.title,
            "level": null,
            "bc": null
        }

        results.push(temp);
    });

    return results;
}
