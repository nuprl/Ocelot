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

module.exports = { raise, memberExpression };