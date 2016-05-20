(function() {
  var CND, LTSORT, alert, badge, debug, echo, help, info, join, log, njs_path, rpr, test, urge, warn, whisper,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  njs_path = require('path');

  join = njs_path.join;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'LTSORT/tests';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  test = require('guy-test');

  LTSORT = require('./main');

  this._probes = {
    'extended': [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z'], ['γ', 'B'], ['Z', 'Ψ'], ['Z', 'Ω'], ['β', 'A'], ['α', 'β']],
    'small': [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z']]
  };

  this["sorting"] = function(T) {
    var a, a_idx, b, b_idx, element, elements, graph, i, len, probe;
    elements = this._probes['extended'];
    graph = LTSORT.populate(LTSORT.new_graph(), elements);
    probe = LTSORT.linearize(graph);
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (CND.isa_text(element)) {
        continue;
      }
      a = element[0], b = element[1];
      T.ok((a_idx = probe.indexOf(a)) >= 0);
      T.ok((b_idx = probe.indexOf(b)) >= 0);
      T.ok(a_idx < b_idx);
    }
    return null;
  };

  this["existence"] = function(T) {
    var a, b, element, elements, graph, i, len;
    elements = this._probes['extended'];
    graph = LTSORT.populate(LTSORT.new_graph(), elements);
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (CND.isa_text(element)) {
        T.ok(LTSORT.has_node(graph, element));
      } else {
        a = element[0], b = element[1];
        T.ok(LTSORT.has_node(graph, a));
        T.ok(LTSORT.has_node(graph, b));
      }
    }
    return null;
  };

  this["deletion"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph(), elements);
    T.ok(LTSORT.has_node(graph, 'A'));
    LTSORT["delete"](graph, 'A');
    T.ok(!LTSORT.has_node(graph, 'A'));
    T.throws("unknown node 'XXX'", ((function(_this) {
      return function() {
        return LTSORT["delete"](graph, 'XXX');
      };
    })(this)));
    T.throws("unable to remove non-root node 'X'", ((function(_this) {
      return function() {
        return LTSORT["delete"](graph, 'X');
      };
    })(this)));
    T.ok(LTSORT.has_node(graph, 'B'));
    LTSORT["delete"](graph, 'B');
    T.ok(!LTSORT.has_node(graph, 'B'));
    T.ok(LTSORT.has_node(graph, 'X'));
    LTSORT["delete"](graph, 'X');
    T.ok(!LTSORT.has_node(graph, 'X'));
    return null;
  };

  this["root nodes, lone nodes (1)"] = function(T) {
    var a, b, element, elements, graph, i, len;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph(), elements);
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (CND.isa_text(element)) {
        LTSORT.add(graph, element);
      } else {
        a = element[0], b = element[1];
        LTSORT.add(graph, a, '>', b);
      }
    }
    T.eq(LTSORT.find_root_nodes(graph), ['A', 'B', 'F']);
    T.eq(LTSORT.find_root_nodes(graph, true), ['A', 'B', 'F']);
    T.eq(LTSORT.find_root_nodes(graph, false), ['A', 'B']);
    T.eq(LTSORT.find_lone_nodes(graph), ['F']);
    return null;
  };

  this["root nodes, lone nodes (2)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    T.eq(LTSORT.find_root_nodes(graph), ['A', 'B']);
    T.eq(LTSORT.find_root_nodes(graph, true), ['A', 'B', 'F']);
    T.eq(LTSORT.find_root_nodes(graph, false), ['A', 'B']);
    T.eq(LTSORT.find_lone_nodes(graph), ['F']);
    return null;
  };

  this["copy (1)"] = function(T) {
    var elements, graph_0, graph_1, i, len, name_0, precedents_0, precedents_1, ref, ref1;
    elements = this._probes['small'];
    graph_0 = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    graph_1 = LTSORT.new_graph(graph_0);
    T.eq(graph_0['loners'], graph_1['loners']);
    T.ok(graph_0 !== graph_1);
    T.ok(LTSORT.has_nodes(graph_0));
    T.ok(LTSORT.has_nodes(graph_1));
    ref = Array.from(graph_0['precedents'].entries());
    for (i = 0, len = ref.length; i < len; i++) {
      ref1 = ref[i], name_0 = ref1[0], precedents_0 = ref1[1];
      precedents_1 = graph_1['precedents'].get(name_0);
      T.ok(precedents_0 !== precedents_1);
      T.eq(precedents_0, precedents_1);
    }
    return null;
  };

  this["copy (2)"] = function(T) {
    var elements, graph_0, graph_1, i, len, name_0, precedents_0, precedents_1, ref, ref1;
    elements = this._probes['small'];
    graph_0 = LTSORT.populate(LTSORT.new_graph({
      loners: true
    }), elements);
    graph_1 = LTSORT.new_graph(graph_0);
    T.eq(graph_0['loners'], graph_1['loners']);
    T.ok(graph_0 !== graph_1);
    T.ok(LTSORT.has_nodes(graph_0));
    T.ok(LTSORT.has_nodes(graph_1));
    ref = Array.from(graph_0['precedents'].entries());
    for (i = 0, len = ref.length; i < len; i++) {
      ref1 = ref[i], name_0 = ref1[0], precedents_0 = ref1[1];
      precedents_1 = graph_1['precedents'].get(name_0);
      T.ok(precedents_0 !== precedents_1);
      T.eq(precedents_0, precedents_1);
    }
    return null;
  };

  this["group (1)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    T.eq(LTSORT.group(graph), [['A', 'B', 'F'], ['X'], ['Y', 'Z']]);
    return null;
  };

  this["group (2)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: true
    }), elements);
    T.eq(LTSORT.group(graph), [['F'], ['A', 'B'], ['X'], ['Y', 'Z']]);
    return null;
  };

  this["group (3)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    LTSORT["delete"](graph, 'F');
    T.eq(LTSORT.group(graph), [['A', 'B'], ['X'], ['Y', 'Z']]);
    return null;
  };

  this["group (4)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: true
    }), elements);
    LTSORT["delete"](graph, 'F');
    T.eq(LTSORT.group(graph), [[], ['A', 'B'], ['X'], ['Y', 'Z']]);
    return null;
  };

  this["test for lone node"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: true
    }), elements);
    T.eq(LTSORT.is_lone_node(graph, 'F'), true);
    T.eq(LTSORT.is_lone_node(graph, 'A'), false);
    T.throws("unknown node 'XXX'", ((function(_this) {
      return function() {
        return LTSORT.is_lone_node(graph, 'XXX');
      };
    })(this)));
    return null;
  };

  this["example ()"] = function(T) {
    var elements, graph, tasks;
    graph = LTSORT.new_graph();
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z'], ['γ', 'B'], ['Z', 'Ψ'], ['Ψ', 'Ω'], ['Z', 'Ω'], ['β', 'A'], ['α', 'β']];
    LTSORT.populate(graph, elements);
    tasks = LTSORT.linearize(graph);
    debug('0809', tasks);
    return null;
  };

  this._demo = function(S) {
    var element, elements, graph, i, j, k, len, len1, len2, lone_node, lone_nodes, ref, root_node, root_nodes;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    ref = LTSORT.linearize(graph);
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      help(element);
    }
    debug(graph);
    if (LTSORT.has_nodes(graph)) {
      if ((lone_nodes = LTSORT.find_lone_nodes(graph)).length > 0) {
        info(CND.rainbow(lone_nodes));
        for (j = 0, len1 = lone_nodes.length; j < len1; j++) {
          lone_node = lone_nodes[j];
          LTSORT["delete"](graph, lone_node);
        }
      }
    }
    while (LTSORT.has_nodes(graph)) {
      root_nodes = LTSORT.find_root_nodes(graph);
      info(CND.rainbow(root_nodes));
      for (k = 0, len2 = root_nodes.length; k < len2; k++) {
        root_node = root_nodes[k];
        LTSORT["delete"](graph, root_node);
      }
    }
    return null;
  };

  this._main = function(handler) {
    return test(this, {
      'timeout': 2500
    });
  };

  this._prune = function() {
    var name, value;
    for (name in this) {
      value = this[name];
      if (name.startsWith('_')) {
        continue;
      }
      if (indexOf.call(include, name) < 0) {
        delete this[name];
      }
    }
    return null;
  };

  if (module.parent == null) {
    CND.dir(LTSORT);
    this._main();
  }

}).call(this);

//# sourceMappingURL=../sourcemaps/tests.js.map
