/**
 * Search the locally available frameworks for a search term. The search is started by
 * sending a GET request against the respective endpoint of the MOOChub Metadata Tool V3
 * API with the search term as the parameter.
 *
 * @param search_term{string} - The term to be searched for.
 * @returns {Promise<Array,null>} - An array containing the search results (already in the proper format)
 * or "null" if no match was found.
 */
export async function search_local(search_term){
    const url = '/conduct_search?query=' + search_term;

    let res_data = null; // make res_data variable accessible outside the fetch

    await fetch(url)
        .then(response => {
            if (!response.ok){
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            res_data = data;
        })
        .catch(error => {
            console.error('Fetched error local search: ' + error);
        });
    return res_data;
}
