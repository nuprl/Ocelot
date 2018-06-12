function raise(message: string) {
    throw message;
}

function memberExpression(obj: any, name: any): any {
    if (typeof obj[name] === 'undefined') {
        throw 'bad name';
    }
    else {
        return obj[name];
    }
}

export = { raise, memberExpression };