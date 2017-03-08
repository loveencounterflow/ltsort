(function() {
  var CND, alert, badge, debug, echo, help, info, log, njs_fs, njs_path, njs_util, rpr, urge, warn, whisper,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
        this.add(me, a, b);
      }
    }
    return me;
  };

  this._link = function(me, precedent, consequent) {
    var target;
    this._register(me, precedent);
    this._register(me, consequent);
    target = me['precedents'].get(consequent);
    if (indexOf.call(target, precedent) < 0) {
      target.push(precedent);
    }
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

  this.add = function(me, precedent, consequent) {
    if (consequent == null) {
      consequent = null;
    }
    if (consequent != null) {
      return this._link(me, precedent, consequent);
    }
    return this._register(me, precedent);
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
    this.linearize(me);
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

  this.get_linearity = function(me) {

    /* Linearity of a given dependency graph measures how well the dependency relations in a graph
    determine an ordering of its nodes. For a graph that defines a unique, single chain of antecedents and
    consequents, linearity will be 1; for a graph that defines only nodes and no dependency edges, linearity
    will be zero; for all other kind of graphs, linearity will be the inverse of the average group length.
    The linearity of all graphs with a single element is 1. The linearity of the emtpy graph is also 1, since
    that is the limit that is approached taking ever more nodes out of maximally linear as well as out of
    minimally linear (parallel-only) graphs.
     */
    var group_count, node_count, ref;
    ref = this._get_group_and_node_count(me), group_count = ref[0], node_count = ref[1];
    return group_count / node_count;
  };

  this._get_group_and_node_count = function(me) {
    var group, group_count, groups, i, len, node_count;
    if (me['loners']) {
      throw new Error("linearity not implemented for graphs with loners");
    }
    groups = this.group(me);
    group_count = groups.length;
    if (group_count === 0) {
      return [1, 1];
    }
    node_count = 0;
    for (i = 0, len = groups.length; i < len; i++) {
      group = groups[i];
      node_count += group.length;
    }
    return [group_count, node_count];
  };

  this.get_normal_linearity = function(me) {
    var group_count, minimum, node_count, ref, shrink;
    ref = this._get_group_and_node_count(me), group_count = ref[0], node_count = ref[1];
    if ((group_count === node_count && node_count === 1)) {
      return 1;
    }
    minimum = 1 / node_count;
    shrink = 1 - minimum;
    return ((group_count / node_count) - minimum) / shrink;
  };

}).call(this);

//# sourceMappingURL=../sourcemaps/main.js.map
