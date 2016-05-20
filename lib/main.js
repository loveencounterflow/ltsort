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
    if (CND.isa(settings, 'LTSORT/graph')) {
      return this._copy(settings);
    }
    if (settings == null) {
      settings = {};
    }
    R = {
      '~isa': 'LTSORT/graph',
      'precedents': new Map(),
      'loners': (ref = settings['loners']) != null ? ref : true
    };
    return R;
  };

  this._copy = function(me) {
    var R, i, len, name, precedent, precedents, ref, ref1;
    R = this.new_graph({
      loners: me['loners']
    });
    ref = Array.from(me['precedents'].entries());
    for (i = 0, len = ref.length; i < len; i++) {
      ref1 = ref[i], name = ref1[0], precedents = ref1[1];
      R['precedents'].set(name, (function() {
        var j, len1, results1;
        results1 = [];
        for (j = 0, len1 = precedents.length; j < len1; j++) {
          precedent = precedents[j];
          results1.push(precedent);
        }
        return results1;
      })());
    }
    return R;
  };

  this.populate = function(me, elements) {
    var a, b, element, i, len;
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (CND.isa_text(element)) {
        this.add(me, element);
      } else {
        a = element[0], b = element[1];
        this.add(me, a, '>', b);
      }
    }
    return me;
  };

  this._link = function(me, precedent, consequent) {
    this._register(me, precedent);
    this._register(me, consequent);
    (me['precedents'].get(consequent)).push(precedent);
    return me;
  };

  this._register = function(me, name) {
    var target;
    if ((target = me['precedents'].get(name)) == null) {
      me['precedents'].set(name, []);
    }
    return me;
  };

  this._get_precedents = function(me, name) {
    var R;
    if ((R = me['precedents'].get(name)) == null) {
      throw new Error("unknown node " + (rpr(name)));
    }
    return R;
  };

  this["delete"] = function(me, name) {
    var i, idx, j, len, precedents, ref, ref1;
    precedents = this._get_precedents(me, name);
    if (precedents.length !== 0) {
      throw new Error("unable to remove non-root node " + (rpr(name)));
    }
    me['precedents']["delete"](name);
    ref = Array.from(me['precedents'].values());
    for (i = 0, len = ref.length; i < len; i++) {
      precedents = ref[i];
      for (idx = j = ref1 = precedents.length - 1; j >= 0; idx = j += -1) {
        if (precedents[idx] !== name) {
          continue;
        }
        precedents.splice(idx, 1);
      }
    }
    return null;
  };

  this._has_precedents = function(me, name) {
    return (this._get_precedents(me, name)).length > 0;
  };

  this._is_precedent = function(me, name) {
    var i, len, precedents, ref;
    ref = Array.from(me['precedents'].values());
    for (i = 0, len = ref.length; i < len; i++) {
      precedents = ref[i];
      if ((precedents.indexOf(name)) >= 0) {
        return true;
      }
    }
    return false;
  };

  this.find_root_nodes = function(me, loners) {
    var name, test;
    if (loners == null) {
      loners = null;
    }
    if (loners != null ? loners : me['loners']) {
      test = (function(_this) {
        return function(name) {
          return !_this._has_precedents(me, name);
        };
      })(this);
    } else {
      test = (function(_this) {
        return function(name) {
          return (!_this._has_precedents(me, name)) && (_this._is_precedent(me, name));
        };
      })(this);
    }
    return (function() {
      var i, len, ref, results1;
      ref = Array.from(me['precedents'].keys());
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        name = ref[i];
        if (test(name)) {
          results1.push(name);
        }
      }
      return results1;
    })();
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
      if (!this._is_precedent(me, name)) {
        R.push(name);
      }
    }
    return R;
  };

  this.is_lone_node = function(me, name) {
    return (!this._is_precedent(me, name)) && (!this._has_precedents(me, name));
  };

  this.has_node = function(me, name) {
    return me['precedents'].has(name);
  };

  this.has_nodes = function(me) {
    return me['precedents'].size > 0;
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
    var i, len, precedent, ref;
    if (marks[name] === 'visiting') {
      throw new Error("detected cycle involving node " + (rpr(name)));
    }
    if (marks[name] != null) {
      return null;
    }
    marks[name] = 'visiting';
    ref = this._get_precedents(me, name);
    for (i = 0, len = ref.length; i < len; i++) {
      precedent = ref[i];
      this._visit(me, results, marks, precedent);
    }
    marks[name] = 'ok';
    results.push(name);
    return null;
  };

  this.linearize = function(me) {

    /* As given in http://en.wikipedia.org/wiki/Topological_sorting */
    var R, consequent, consequents, i, len, marks;
    consequents = Array.from(me['precedents'].keys());
    R = [];
    marks = {};
    for (i = 0, len = consequents.length; i < len; i++) {
      consequent = consequents[i];
      if (marks[consequent] == null) {
        this._visit(me, R, marks, consequent);
      }
    }
    return R;
  };

  this.group = function(me, loners) {
    var R, i, j, len, len1, lone_node, lone_nodes, root_node, root_nodes, you;
    if (loners == null) {
      loners = null;
    }
    you = this.new_graph(me);
    loners = loners != null ? loners : me['loners'];
    R = [];
    if (loners) {
      if (this.has_nodes(you)) {
        lone_nodes = this.find_lone_nodes(you);
        R.push(lone_nodes);
        for (i = 0, len = lone_nodes.length; i < len; i++) {
          lone_node = lone_nodes[i];
          this["delete"](you, lone_node);
        }
      }
    }
    while (this.has_nodes(you)) {
      root_nodes = this.find_root_nodes(you, true);
      R.push(root_nodes);
      for (j = 0, len1 = root_nodes.length; j < len1; j++) {
        root_node = root_nodes[j];
        this["delete"](you, root_node);
      }
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=../sourcemaps/main.js.map
