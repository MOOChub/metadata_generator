export const sep = '--';
export const frameworks_complete = new Map();
export const all_selected = new Map();
export const mapping_full_names = new Map();


export function compare_entries_by_name(entry1, entry2){
    const name1 = entry1.name.toUpperCase();
    const name2 = entry2.name.toUpperCase();

    if(name1 < name2){
        return -1;
    }
    if(name1 > name2){
        return 1;
    }
    return 0;
}

export function unify_name_style(name){
    return name[0].toUpperCase() + name.slice(1,name.length).toLowerCase();
}
