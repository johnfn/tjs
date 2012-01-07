var util = require('util');

function lex(string) {

  var EMPTY_FLAG = "empty";

  //move into array of regexen.

  var paren = function() {
    return /^([()])/.exec(string);
  }

  var identifier = function() {
    return /^([<>=\.\-+A-Za-z0-9]+)/.exec(string);
  }

  var whitespace = function() {
    return /^(\s+)/.exec(string);
  }

  var tokens = [];

  while (string.length > 0) {
    var result = (whitespace() || paren() || identifier())[1];
    console.log(util.inspect(result));

    if (whitespace()) {
      string = string.substring(result.length);
      continue;
    }

    string = string.substring(result.length);

    tokens.push(result);
  }

  return tokens;
}

function parse(tokens) {

}


console.log(lex("(for (var i 0) (< i 10) (+= i 1) \n (console.log i))"));

