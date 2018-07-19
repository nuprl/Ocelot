function raise(message: string) {
    throw message;
}

let accessedVal: any = undefined;
// I'll be assuming getMember is also run first to check if 
// val is undefined
function getMember(obj: any, property: string, diffObj: boolean = false) {
    if (diffObj) {
        accessedVal = obj[property];
        return accessedVal;
    }
    return accessedVal;
}

export = { raise, getMember };