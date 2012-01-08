var util = require('util');

function d(obj) {
  console.log(util.inspect(obj));
}

function assert(bool, str) {
  if (bool == false) {
    console.log(str);
    throw OhCrap;
  }
}

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

    if (whitespace()) {
      string = string.substring(result.length);
      continue;
    }

    string = string.substring(result.length);

    tokens.push(result);
  }

  return tokens;
}

//prefer o2 over o1
function merge_objects(o1, o2) {
  var copy = o1; //this doesn't work
  for (key in o2) {
    copy[key] = o2[key];
  }

  return copy;
}

function Node(args) {
  this.args = args;

  /* Checks to see if the name of the function that we're calling is `form_name` */
  this.form_is = function(form_name) {
    return this.args[0].is_atom() && (this.args[0].contents == form_name);
  }

  this.compile = function() {

  };

  this.is_atom = function() {
    return false;
  }

  this.get_types = function() {
    var types = {};

    assert(this.form_is("var"), "var not first line of code in do block");
    for (var i = 1; i < this.args.length; i += 2) {
      assert(this.args[i].is_atom() && this.args[i + 1].is_atom(), "non-atoms in var statement");

      types[this.args[i].contents] = this.args[i + 1].contents;
    }

    return types;
  }

  this.typecheck = function(locals) {
    var typechecks;

    locals = locals || {};

    if (this.form_is("do")) {
      typechecks = true;

      locals = merge_objects(locals, this.args[1].get_types());
      for (var i = 2; i < this.args.length; i++) {
        typechecks = typechecks && this.args[i].typecheck(locals);
      }
    } else if (this.form_is("+")) {
      typechecks = (this.args[1].type(locals) == this.args[2].type(locals)) && (this.args[1].type(locals) == "string" || this.args[1].type(locals) == "int");
    } else if (this.form_is("-")) {
      typechecks == (this.args[1].type(locals) == this.args[2].type(locals) == "int");
    }

    return typechecks;
  }

  this.tostring = function() {
    var result = "(";
    for (var i = 0; i < this.args.length; i++) {
      result += this.args[i].tostring() + " ";
    }
    result += ")";

    return result;
  };
}

function Atom(contents) {
  this.contents = contents;

  this.is_atom = function() {
    return true;
  }

  this.type = function(locals) {
    if (/[0-9\.]/.exec(this.contents)) {
      return "int";
    } else {
      /* identifier */
      if (this.contents in locals) {
        return locals[this.contents];
      } else {
        console.log("Undefined variable " + this.contents);

        throw UndefinedVariableException;
        return undefined;
      }
    }
  }

  this.compile = function() {
    return this.contents;
  };

  this.tostring = function() {
    return this.contents;
  }
}

function parse(tokens) {
  if (tokens.length == 1) {
    return new Atom(tokens[0]);
  }

  assert(tokens[0] == "(" && tokens[tokens.length - 1] == ")", "Ill-formed expression in parser.");

  var forms = [];
  var depth = 0;
  var long_form = [];

  for (var i = 1; i < tokens.length - 1; i++) {
    var cur_tok = tokens[i];

    if (cur_tok == "(") {
      depth++;
    } else if (cur_tok == ")") {
      depth--;
    }

    long_form.push(cur_tok);

    if (depth == 0) {
      forms.push(parse(long_form));
      long_form = [];
    }
  }

  return new Node(forms);
}

var ast = parse(lex("(do (var i int s string) (+ i s))"));

if (ast.typecheck()) {
  console.log("Type checks!");
} else {
  console.log ("Does not type check.");
}

