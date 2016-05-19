(function() {
  var CND, alert, badge, debug, echo, help, info, log, njs_fs, njs_path, njs_util, rpr, urge, warn, whisper;

  njs_util = require('util');

  njs_path = require('path');

  njs_fs = require('fs');

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'LTSORT';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);


  /* Adapted from https://github.com/eknkc/tsort */

  this.new_graph = function(settings) {
    var R, ref;
    if (settings == null) {
      settings = {};
    }
    R = {
      '~isa': 'CND/tsort-graph',
      'precedents': {},
      'loners': (ref = settings['loners']) != null ? ref : true
    };
    return R;
  };

  this._link = function(me, precedence, consequence) {

    /* TAINT check for trivial errors such as precedence == consequence */
    var base, base1;
    if ((base = me['precedents'])[precedence] == null) {
      base[precedence] = [];
    }
    ((base1 = me['precedents'])[consequence] != null ? base1[consequence] : base1[consequence] = []).push(precedence);
    return me;
  };

  this._register = function(me, name) {
    var base;
    if ((base = me['precedents'])[name] == null) {
      base[name] = [];
    }
    return me;
  };

  this["delete"] = function(me, name) {
    var consequence, i, idx, precedences, ref, ref1;
    if (!(name in me['precedents'])) {
      throw new Error("unknown node " + (rpr(name)));
    }
    if (me['precedents'][name].length !== 0) {
      throw new Error("unable to remove non-root node " + (rpr(name)));
    }
    delete me['precedents'][name];
    ref = me['precedents'];
    for (consequence in ref) {
      precedences = ref[consequence];
      for (idx = i = ref1 = precedences.length - 1; i >= 0; idx = i += -1) {
        if (precedences[idx] !== name) {
          continue;
        }
        precedences.splice(idx, 1);
      }
    }
    return null;
  };

  this.find_root_nodes = function(me, loners) {
    var name, test;
    if (loners == null) {
      loners = null;
    }
    if (loners != null ? loners : me['loners']) {
      test = (function(_this) {
        return function(name) {
          return !_this._has_precedences(me, name);
        };
      })(this);
    } else {
      test = (function(_this) {
        return function(name) {
          return (!_this._has_precedences(me, name)) && (_this._is_precedence(me, name));
        };
      })(this);
    }
    return (function() {
      var results1;
      results1 = [];
      for (name in me['precedents']) {
        if (test(name)) {
          results1.push(name);
        }
      }
      return results1;
    })();
  };

  this._has_precedences = function(me, name) {
    return me['precedents'][name].length > 0;
  };

  this._is_precedence = function(me, name) {
    var _, precedences, ref;
    ref = me['precedents'];
    for (_ in ref) {
      precedences = ref[_];
      if ((precedences.indexOf(name)) >= 0) {
        return true;
      }
    }
    return false;
  };

  this.find_lone_nodes = function(me, root_nodes) {
    var R, i, len, name, ref;
    if (root_nodes == null) {
      root_nodes = null;
    }
    R = [];
    ref = root_nodes != null ? root_nodes : this.find_root_nodes(me, true);
    for (i = 0, len = ref.length; i < len; i++) {
      name = ref[i];
      if (!this._is_precedence(me, name)) {
        R.push(name);
      }
    }
    return R;
  };

  this.has_node = function(me, name) {
    return name in me['precedents'];
  };

  this.has_nodes = function(me) {
    return (Object.keys(me['precedents'])).length > 0;
  };

  this.add = function(me, lhs, relation, rhs) {
    if (relation == null) {
      relation = null;
    }
    if (rhs == null) {
      rhs = null;
    }
    switch (relation) {
      case '>':
        return this._link(me, lhs, rhs);
      case '<':
        return this._link(me, rhs, lhs);
      case null:
        if (rhs != null) {
          throw new Error("no relation given");
        }
        return this._register(me, lhs);
      default:
        throw new Error("expected '<' or '>' for relation argument, got " + (CND.rpr(relation)));
    }
    return null;
  };

  this._visit = function(me, results, marks, name) {
    var i, len, ref, sub_name;
    if (marks[name] === 'temp') {
      throw new Error("detected cycle involving node " + (CND.rpr(name)));
    }
    if (marks[name] != null) {
      return null;
    }
    marks[name] = 'temp';
    ref = me['precedents'][name];
    for (i = 0, len = ref.length; i < len; i++) {
      sub_name = ref[i];
      this._visit(me, results, marks, sub_name);
    }
    marks[name] = 'ok';
    results.push(name);
    return null;
  };

  this.linearize = function(me) {

    /* As given in http://en.wikipedia.org/wiki/Topological_sorting */
    var R, i, len, marks, precedence, precedences;
    precedences = Object.keys(me['precedents']);
    R = [];
    marks = {};
    for (i = 0, len = precedences.length; i < len; i++) {
      precedence = precedences[i];
      if (marks[precedence] == null) {
        this._visit(me, R, marks, precedence);
      }
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=../sourcemaps/main.js.map
