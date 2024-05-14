import {Entry} from "../models/entry_model.js";

/**
 * Gets all entries for a defined framework. The data is received via a GET request on the
 * MOOChub Metadata Tool API.
 *
 * @param {string} framework - The name of the framework (same as ID/key in the frameworks_config).
 * @returns {Promise<null>} - The framework data containing all entries of this framework.
 */
export async function get_framework(framework){
    const url = '/get_framework?framework=' + framework

    let framework_data = null;

    await fetch(url)
        .then(response => {
            if(!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            framework_data = process_data(framework, data); // The received data needs some preprocessing
                                                            // before it can be used on the client side.
        })
        .catch(e => {
            console.error('Error with get framework:', e);
        });

    return framework_data;
}


/**
 * Preprocesses the data for further use. E.g. the Entry objects according to the internal
 * specification are created. The tree-like structure of the framework with narrower and broader
 * concepts is created.
 *
 * @param framework_name {string} - The name of the framework.
 * @param data {Array} - All entries of the framework.
 * @returns {*[]} - An array of the top-level entries. Each entry contains the sub-entries of the narrower level
 * and so forth.
 */
function process_data(framework_name, data){
    const processed_data = [];

    data.forEach(element => {
        const entry = new Entry(framework_name, element['Name'], element['Level'], element['BroaderConcept'], element['Description']);

        if(entry.level === 1){
            processed_data.push(entry);
        } else{
            iterate_through_framework(entry, processed_data);
        }
    });

    return processed_data;
}


/**
 * Iterate through all given entries and create the tree-like structure by adding the entries to
 * the correct sub-entry array.
 *
 * @param entry {Entry} - The entry to be added to a sub-entry array.
 * @param forgoing_entries {Array<Entry>} - All already correctly assigned entries and corresponding sub-entries.
 */
function iterate_through_framework(entry, forgoing_entries){
    forgoing_entries.forEach(forgoing => {
        if(entry.bc === forgoing.name && entry.level === (forgoing.level + 1)){
            entry.bc = forgoing; // connecting every entry to its broader concept for easier navigation in the framework
            forgoing.add_sub_entry(entry);
        } else {
            iterate_through_framework(entry, forgoing.sub_entries);
        }
    });
}
