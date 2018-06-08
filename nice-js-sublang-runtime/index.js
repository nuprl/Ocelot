function raise(message) {
  throw message;
}

function memberExpression(obj, name) {
  if (obj[name] === undefined) {
    throw 'bad name';
  }
  else {
    return obj[name];
  }
}

module.exports = { raise, memberExpression };