export class Entry {

    _sub_entries = [];
    constructor(framework, name, level, bc, description) {
        this._framework = framework;
        this._name = name;
        this._level = level;
        this._bc = bc;
        this._description = description;

        this._checked = false;
    }

    get framework(){
        return this._framework;
    }

    get name(){
        return this._name;
    }

    get level(){
        return this._level;
    }

    get description(){
        return this._description;
    }

    get bc(){
        return this._bc;
    }

    set bc(bc){
        this._bc = bc;
    }

    get checked(){
        return this._checked;
    }

    setChecked(isChecked){
        this._checked = isChecked;
    }

    get sub_entries(){
        return this._sub_entries;
    }

    add_sub_entry(entry){
        this._sub_entries.push(entry);
    }

    printAllData(){
        //let data = `{"Name": "${this._name}", "BroaderConcept": "${this._bc.name}", "Level": ${this._level}, "Description": "${this._description}"}`;
        return `{"Name": "${this._name}", "BroaderConcept": "${this._bc.name}"}`;
    }
}

export class Framework {

    _top_level_entries = [];

    constructor(name) {
        this._name = name;
    }

    get name(){
        return this._name;
    }

    get top_level_entries(){
        return this._top_level_entries;
    }

    add_entry(entry){
        this._top_level_entries.push(entry);
    }
}