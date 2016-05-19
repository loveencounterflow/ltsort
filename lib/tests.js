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

  this["sorting"] = function(T) {
    var a, a_idx, b, b_idx, element, elements, graph, i, j, len, len1, probe;
    graph = LTSORT.new_graph();
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z'], ['γ', 'B'], ['Z', 'Ψ'], ['Z', 'Ω'], ['β', 'A'], ['α', 'β']];
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (CND.isa_text(element)) {
        LTSORT.add(graph, element);
      } else {
        a = element[0], b = element[1];
        LTSORT.add(graph, a, '>', b);
      }
    }
    probe = LTSORT.linearize(graph);
    for (j = 0, len1 = elements.length; j < len1; j++) {
      element = elements[j];
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
    var a, b, element, elements, graph, i, j, len, len1;
    graph = LTSORT.new_graph();
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z'], ['γ', 'B'], ['Z', 'Ψ'], ['Z', 'Ω'], ['β', 'A'], ['α', 'β']];
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (CND.isa_text(element)) {
        LTSORT.add(graph, element);
      } else {
        a = element[0], b = element[1];
        LTSORT.add(graph, a, '>', b);
      }
    }
    for (j = 0, len1 = elements.length; j < len1; j++) {
      element = elements[j];
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
    var a, b, element, elements, graph, i, len;
    graph = LTSORT.new_graph();
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z']];
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (CND.isa_text(element)) {
        LTSORT.add(graph, element);
      } else {
        a = element[0], b = element[1];
        LTSORT.add(graph, a, '>', b);
      }
    }
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
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z']];
    graph = LTSORT.new_graph();
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
    var a, b, element, elements, graph, i, len;
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z']];
    graph = LTSORT.new_graph({
      loners: false
    });
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (CND.isa_text(element)) {
        LTSORT.add(graph, element);
      } else {
        a = element[0], b = element[1];
        LTSORT.add(graph, a, '>', b);
      }
    }
    T.eq(LTSORT.find_root_nodes(graph), ['A', 'B']);
    T.eq(LTSORT.find_root_nodes(graph, true), ['A', 'B', 'F']);
    T.eq(LTSORT.find_root_nodes(graph, false), ['A', 'B']);
    T.eq(LTSORT.find_lone_nodes(graph), ['F']);
    return null;
  };

  this._demo = function(S) {
    var a, b, element, elements, graph, i, j, k, l, len, len1, len2, len3, lone_node, lone_nodes, ref, root_node, root_nodes;
    graph = LTSORT.new_graph();
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z'], ['γ', 'B'], ['Z', 'Ψ'], ['Z', 'Ω'], ['β', 'A'], ['α', 'β']];
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (CND.isa_text(element)) {
        LTSORT._register(graph, element);
      } else {
        a = element[0], b = element[1];
        LTSORT.add(graph, a, '>', b);
      }
    }
    ref = LTSORT.sort(graph);
    for (j = 0, len1 = ref.length; j < len1; j++) {
      element = ref[j];
      help(element);
    }
    debug(graph);
    if (LTSORT.has_nodes(graph)) {
      if ((lone_nodes = LTSORT.find_lone_nodes(graph)).length > 0) {
        info(CND.rainbow(lone_nodes));
        for (k = 0, len2 = lone_nodes.length; k < len2; k++) {
          lone_node = lone_nodes[k];
          LTSORT["delete"](graph, lone_node);
        }
      }
    }
    while (LTSORT.has_nodes(graph)) {
      root_nodes = LTSORT.find_root_nodes(graph);
      info(CND.rainbow(root_nodes));
      for (l = 0, len3 = root_nodes.length; l < len3; l++) {
        root_node = root_nodes[l];
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
    this._main();
  }

}).call(this);

//# sourceMappingURL=../sourcemaps/tests.js.map
