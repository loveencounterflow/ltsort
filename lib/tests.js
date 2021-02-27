(function() {
  //###########################################################################################################
  var CND, LTSORT, alert, badge, debug, echo, help, include, info, join, log, njs_path, rpr, test, urge, warn, whisper,
    indexOf = [].indexOf;

  njs_path = require('path');

  // njs_fs                    = require 'fs'
  join = njs_path.join;

  //...........................................................................................................
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

  //...........................................................................................................
  test = require('guy-test');

  LTSORT = require('./main');

  //===========================================================================================================
  // DATA
  //-----------------------------------------------------------------------------------------------------------
  this._probes = {
    'extended': [
      ['A',
      'X'],
      ['B',
      'X'],
      'F',
      ['X',
      'Y'],
      ['X',
      'Z'],
      ['δ',
      'B'],
      ['Z',
      'Ψ'],
      // [ 'Ψ', 'Ω', ]
      ['Z',
      'Ω'],
      ['β',
      'A'],
      ['α',
      'β']
    ],
    //.........................................................................................................
    'small': [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z']]
  };

  //===========================================================================================================
  // TESTS
  //-----------------------------------------------------------------------------------------------------------
  this["sorting"] = function(T) {
    var a, a_idx, b, b_idx, element, elements, graph, i, len, probe;
    elements = this._probes['extended'];
    graph = LTSORT.populate(LTSORT.new_graph(), elements);
    probe = LTSORT.linearize(graph);
//.........................................................................................................
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (LTSORT.types.isa.text(element)) {
        continue;
      }
      [a, b] = element;
      T.ok((a_idx = probe.indexOf(a)) >= 0);
      T.ok((b_idx = probe.indexOf(b)) >= 0);
      T.ok(a_idx < b_idx);
    }
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["existence"] = function(T) {
    var a, b, element, elements, graph, i, len;
    elements = this._probes['extended'];
    graph = LTSORT.populate(LTSORT.new_graph(), elements);
//.........................................................................................................
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (LTSORT.types.isa.text(element)) {
        T.ok(LTSORT.has_node(graph, element));
      } else {
        [a, b] = element;
        T.ok(LTSORT.has_node(graph, a));
        T.ok(LTSORT.has_node(graph, b));
      }
    }
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["deletion"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph(), elements);
    //.........................................................................................................
    T.ok(LTSORT.has_node(graph, 'A'));
    LTSORT.delete(graph, 'A');
    T.ok(!LTSORT.has_node(graph, 'A'));
    //.........................................................................................................
    T.throws("unknown node 'XXX'", (() => {
      return LTSORT.delete(graph, 'XXX');
    }));
    T.throws("unable to remove non-root node 'X'", (() => {
      return LTSORT.delete(graph, 'X');
    }));
    //.........................................................................................................
    T.ok(LTSORT.has_node(graph, 'B'));
    LTSORT.delete(graph, 'B');
    T.ok(!LTSORT.has_node(graph, 'B'));
    //.........................................................................................................
    T.ok(LTSORT.has_node(graph, 'X'));
    LTSORT.delete(graph, 'X');
    T.ok(!LTSORT.has_node(graph, 'X'));
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["root nodes, lone nodes (1)"] = function(T) {
    var a, b, element, elements, graph, i, len;
    //.........................................................................................................
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph(), elements);
//.........................................................................................................
    for (i = 0, len = elements.length; i < len; i++) {
      element = elements[i];
      if (LTSORT.types.isa.text(element)) {
        LTSORT.add(graph, element);
      } else {
        [a, b] = element;
        LTSORT.add(graph, a, '>', b);
      }
    }
    //.........................................................................................................
    T.eq(LTSORT.find_root_nodes(graph), ['A', 'B', 'F']);
    T.eq(LTSORT.find_root_nodes(graph, true), ['A', 'B', 'F']);
    T.eq(LTSORT.find_root_nodes(graph, false), ['A', 'B']);
    T.eq(LTSORT.find_lone_nodes(graph), ['F']);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["root nodes, lone nodes (2)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    //.........................................................................................................
    T.eq(LTSORT.find_root_nodes(graph), ['A', 'B']);
    T.eq(LTSORT.find_root_nodes(graph, true), ['A', 'B', 'F']);
    T.eq(LTSORT.find_root_nodes(graph, false), ['A', 'B']);
    T.eq(LTSORT.find_lone_nodes(graph), ['F']);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["copy (1)"] = function(T) {
    var elements, graph_0, graph_1, i, len, name_0, precedents_0, precedents_1, ref;
    elements = this._probes['small'];
    graph_0 = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    graph_1 = LTSORT.new_graph(graph_0);
    //.........................................................................................................
    T.eq(graph_0['loners'], graph_1['loners']);
    T.ok(graph_0 !== graph_1);
    T.ok(LTSORT.has_nodes(graph_0));
    T.ok(LTSORT.has_nodes(graph_1));
    ref = Array.from(graph_0['precedents'].entries());
    for (i = 0, len = ref.length; i < len; i++) {
      [name_0, precedents_0] = ref[i];
      precedents_1 = graph_1['precedents'].get(name_0);
      T.ok(precedents_0 !== precedents_1);
      T.eq(precedents_0, precedents_1);
    }
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["copy (2)"] = function(T) {
    var elements, graph_0, graph_1, i, len, name_0, precedents_0, precedents_1, ref;
    elements = this._probes['small'];
    graph_0 = LTSORT.populate(LTSORT.new_graph({
      loners: true
    }), elements);
    graph_1 = LTSORT.new_graph(graph_0);
    //.........................................................................................................
    T.eq(graph_0['loners'], graph_1['loners']);
    T.ok(graph_0 !== graph_1);
    T.ok(LTSORT.has_nodes(graph_0));
    T.ok(LTSORT.has_nodes(graph_1));
    ref = Array.from(graph_0['precedents'].entries());
    for (i = 0, len = ref.length; i < len; i++) {
      [name_0, precedents_0] = ref[i];
      precedents_1 = graph_1['precedents'].get(name_0);
      T.ok(precedents_0 !== precedents_1);
      T.eq(precedents_0, precedents_1);
    }
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["group (1)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    //.........................................................................................................
    T.eq(LTSORT.group(graph), [['A', 'B', 'F'], ['X'], ['Y', 'Z']]);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["group (2)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: true
    }), elements);
    //.........................................................................................................
    T.eq(LTSORT.group(graph), [['F'], ['A', 'B'], ['X'], ['Y', 'Z']]);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["group (3)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    //.........................................................................................................
    LTSORT.delete(graph, 'F');
    T.eq(LTSORT.group(graph), [['A', 'B'], ['X'], ['Y', 'Z']]);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["group (4)"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: true
    }), elements);
    LTSORT.delete(graph, 'F');
    //.........................................................................................................
    T.eq(LTSORT.group(graph), [[], ['A', 'B'], ['X'], ['Y', 'Z']]);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["test for lone node"] = function(T) {
    var elements, graph;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: true
    }), elements);
    //.........................................................................................................
    T.eq(LTSORT.is_lone_node(graph, 'F'), true);
    T.eq(LTSORT.is_lone_node(graph, 'A'), false);
    T.throws("unknown node 'XXX'", (() => {
      return LTSORT.is_lone_node(graph, 'XXX');
    }));
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["demo (1)"] = function(T) {
    var elements, graph, tasks;
    graph = LTSORT.new_graph();
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z'], ['δ', 'B'], ['Z', 'Ψ'], ['Ψ', 'Ω'], ['Z', 'Ω'], ['β', 'A'], ['α', 'β']];
    LTSORT.populate(graph, elements);
    tasks = LTSORT.linearize(graph);
    // debug '0809', tasks
    T.eq(tasks, ['α', 'β', 'A', 'δ', 'B', 'X', 'F', 'Y', 'Z', 'Ψ', 'Ω']);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["demo (2)"] = function(T) {
    var elements, graph, tasks;
    graph = LTSORT.new_graph();
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z'], ['δ', 'B'], ['Z', 'Ψ'], ['Ψ', 'Ω'], ['Z', 'Ω'], ['β', 'A'], ['α', 'β']];
    LTSORT.populate(graph, elements);
    tasks = LTSORT.group(graph);
    // debug '0809', tasks
    T.eq(tasks, [['F'], ['δ', 'α'], ['B', 'β'], ['A'], ['X'], ['Y', 'Z'], ['Ψ'], ['Ω']]);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["demo (3)"] = function(T) {
    var elements, graph, tasks;
    graph = LTSORT.new_graph({
      loners: false
    });
    elements = [['A', 'X'], ['B', 'X'], 'F', ['X', 'Y'], ['X', 'Z'], ['δ', 'B'], ['Z', 'Ψ'], ['Ψ', 'Ω'], ['Z', 'Ω'], ['β', 'A'], ['α', 'β']];
    LTSORT.populate(graph, elements);
    tasks = LTSORT.group(graph);
    // debug '0809', tasks
    T.eq(tasks, [['F', 'δ', 'α'], ['B', 'β'], ['A'], ['X'], ['Y', 'Z'], ['Ψ'], ['Ω']]);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["demo (4)"] = function(T) {
    var graph, tasks;
    graph = LTSORT.new_graph({
      loners: false
    });
    //.........................................................................................................
    LTSORT.add(graph, 'buy books', 'do some reading');
    LTSORT.add(graph, 'buy books', 'go home');
    LTSORT.add(graph, 'buy food', 'cook');
    LTSORT.add(graph, 'buy food', 'go home');
    LTSORT.add(graph, 'buy food', 'have a coffee');
    LTSORT.add(graph, 'cook', 'eat');
    LTSORT.add(graph, 'do some reading', 'go to exam');
    LTSORT.add(graph, 'eat', 'do some reading');
    LTSORT.add(graph, 'eat', 'go to exam');
    LTSORT.add(graph, 'fetch money', 'buy books');
    LTSORT.add(graph, 'fetch money', 'buy food');
    LTSORT.add(graph, 'go home', 'cook');
    LTSORT.add(graph, 'go to bank', 'fetch money');
    LTSORT.add(graph, 'have a coffee', 'go home');
    //.........................................................................................................
    tasks = LTSORT.group(graph);
    // debug '0809', tasks
    T.eq(tasks, [['go to bank'], ['fetch money'], ['buy books', 'buy food'], ['have a coffee'], ['go home'], ['cook'], ['eat'], ['do some reading'], ['go to exam']]);
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["using precedents, actions, and consequents"] = function(T) {
    var graph, tasks;
    graph = LTSORT.new_graph({
      loners: false
    });
    //.........................................................................................................
    LTSORT.add(graph, 'is-no-books', 'do-buy-books');
    LTSORT.add(graph, 'do-buy-books', 'is-have-books');
    LTSORT.add(graph, 'is-have-books', 'do-some-reading');
    LTSORT.add(graph, 'is-have-no-knowledge', 'do-some-reading');
    LTSORT.add(graph, 'do-some-reading', 'is-have-knowledge');
    LTSORT.add(graph, 'is-have-knowledge', 'do-go-exam');
    LTSORT.add(graph, 'is-have-books', 'do-go-home');
    LTSORT.add(graph, 'is-hungry', 'do-eat');
    LTSORT.add(graph, 'do-eat', 'is-not-hungry');
    LTSORT.add(graph, 'do-cook', 'do-eat');
    LTSORT.add(graph, 'do-have-food', 'do-eat');
    LTSORT.add(graph, 'do-eat', 'is-have-no-food-again');
    LTSORT.add(graph, 'is-have-no-food', 'do-buy-food');
    LTSORT.add(graph, 'do-buy-food', 'is-have-food');
    // LTSORT.add graph, 'do-go-exam',             'is-not-at-home'
    // LTSORT.add graph, 'buy food',          'cook'
    // LTSORT.add graph, 'buy food',          'go home'
    // LTSORT.add graph, 'buy food',          'have a coffee'
    // LTSORT.add graph, 'cook',              'eat'
    // LTSORT.add graph, 'do some reading',   'go to exam'
    // LTSORT.add graph, 'eat',               'do some reading'
    // LTSORT.add graph, 'eat',               'go to exam'
    // LTSORT.add graph, 'fetch money',       'buy books'
    // LTSORT.add graph, 'fetch money',       'buy food'
    // LTSORT.add graph, 'go home',           'cook'
    // LTSORT.add graph, 'go to bank',        'fetch money'
    // LTSORT.add graph, 'have a coffee',     'go home'
    //.........................................................................................................
    // tasks = LTSORT.group graph
    tasks = LTSORT.linearize(graph);
    debug('0809', tasks);
    // T.eq tasks, [ [ 'go to bank' ],
    //   [ 'fetch money' ],
    //   [ 'buy books', 'buy food' ],
    //   [ 'have a coffee' ],
    //   [ 'go home' ],
    //   [ 'cook' ],
    //   [ 'eat' ],
    //   [ 'do some reading' ],
    //   [ 'go to exam' ] ]
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["cycle detection (1)"] = function(T, done) {
    var graph;
    graph = LTSORT.new_graph({
      loners: false
    });
    //.........................................................................................................
    LTSORT.add(graph, 'A', 'B');
    LTSORT.linearize(graph);
    LTSORT.add(graph, 'B', 'C');
    LTSORT.linearize(graph);
    LTSORT.add(graph, 'C', 'D');
    LTSORT.linearize(graph);
    LTSORT.add(graph, 'D', 'E');
    LTSORT.linearize(graph);
    LTSORT.add(graph, 'E', 'A');
    //.........................................................................................................
    T.throws("detected cycle involving node 'A'", function() {
      return urge(LTSORT.linearize(graph));
    });
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["cycle detection (2)"] = function(T, done) {
    var graph;
    graph = LTSORT.new_graph({
      loners: false
    });
    //.........................................................................................................
    LTSORT.add(graph, 'A', 'B');
    LTSORT.linearize(graph);
    LTSORT.add(graph, 'B', 'C');
    LTSORT.linearize(graph);
    LTSORT.add(graph, 'C', 'D');
    LTSORT.linearize(graph);
    LTSORT.add(graph, 'D', 'E');
    LTSORT.linearize(graph);
    LTSORT.add(graph, 'E', 'A');
    //.........................................................................................................
    T.throws("detected cycle involving node 'A'", function() {
      return urge(LTSORT.group(graph));
    });
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["linearity (1)"] = function(T, done) {
    var graph, groups, linearity;
    //.........................................................................................................
    graph = LTSORT.new_graph({
      loners: false
    });
    debug();
    debug(groups = LTSORT.group(graph));
    debug(linearity = LTSORT.get_linearity(graph));
    T.eq(groups, []);
    T.eq(linearity, 1);
    //.........................................................................................................
    graph = LTSORT.new_graph({
      loners: false
    });
    LTSORT.add(graph, 'A');
    LTSORT.add(graph, 'B');
    LTSORT.add(graph, 'C');
    debug();
    debug(groups = LTSORT.group(graph));
    debug(linearity = LTSORT.get_linearity(graph));
    T.eq(groups, [['A', 'B', 'C']]);
    T.eq(linearity, 0.3333333333333333);
    //.........................................................................................................
    graph = LTSORT.new_graph({
      loners: false
    });
    LTSORT.add(graph, 'A');
    LTSORT.add(graph, 'B');
    LTSORT.add(graph, 'C');
    LTSORT.add(graph, 'D');
    LTSORT.add(graph, 'E');
    debug();
    debug(groups = LTSORT.group(graph));
    debug(linearity = LTSORT.get_linearity(graph));
    T.eq(groups, [['A', 'B', 'C', 'D', 'E']]);
    T.eq(linearity, 0.2);
    debug();
    LTSORT.add(graph, 'A', 'E');
    debug(groups = LTSORT.group(graph));
    debug(linearity = LTSORT.get_linearity(graph));
    T.eq(groups, [['A', 'B', 'C', 'D'], ['E']]);
    T.eq(linearity, 0.4);
    //.........................................................................................................
    graph = LTSORT.new_graph({
      loners: false
    });
    LTSORT.add(graph, 'A', 'B');
    LTSORT.add(graph, 'B', 'C');
    debug();
    debug(groups = LTSORT.group(graph));
    debug(linearity = LTSORT.get_linearity(graph));
    T.eq(groups, [['A'], ['B'], ['C']]);
    T.eq(linearity, 1);
    //.........................................................................................................
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this["linearity (2)"] = function(T, done) {
    var graph, lin, nlin;
    graph = LTSORT.new_graph({
      loners: false
    });
    //.........................................................................................................
    lin = LTSORT.get_linearity(graph);
    nlin = LTSORT.get_normal_linearity(graph);
    T.eq(lin, 1);
    T.eq(nlin, 1);
    //.........................................................................................................
    LTSORT.add(graph, 'X');
    lin = LTSORT.get_linearity(graph);
    nlin = LTSORT.get_normal_linearity(graph);
    T.eq(lin, 1);
    T.eq(nlin, 1);
    //.........................................................................................................
    LTSORT.add(graph, 'Y');
    lin = LTSORT.get_linearity(graph);
    nlin = LTSORT.get_normal_linearity(graph);
    T.eq(lin, 0.5);
    T.eq(nlin, 0);
    //.........................................................................................................
    LTSORT.add(graph, 'Z');
    lin = LTSORT.get_linearity(graph);
    nlin = LTSORT.get_normal_linearity(graph);
    T.eq(lin, 0.3333333333333333);
    T.eq(nlin, 0);
    //.........................................................................................................
    LTSORT.add(graph, 'A', 'B');
    LTSORT.add(graph, 'B', 'C');
    lin = LTSORT.get_linearity(graph);
    nlin = LTSORT.get_normal_linearity(graph);
    T.eq(lin, 0.5);
    T.eq(nlin, 0.4);
    //.........................................................................................................
    LTSORT.add(graph, 'A', 'a');
    lin = LTSORT.get_linearity(graph);
    nlin = LTSORT.get_normal_linearity(graph);
    T.eq(lin, 0.42857142857142855);
    T.eq(nlin, 0.3333333333333333);
    //.........................................................................................................
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this["avoid reduplication"] = function(T, done) {
    var graph;
    graph = LTSORT.new_graph({
      loners: false
    });
    LTSORT.add(graph, 'A', 'B');
    T.eq(graph['precedents'].get('B'), ['A']);
    LTSORT.add(graph, 'A', 'B');
    T.eq(graph['precedents'].get('B'), ['A']);
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this["Ruby inheritance linearization (1)"] = function(T, done) {
    /* patterned after *Ruby's Dark Corners* http://norswap.com/ruby-module-linearization/ */
    /*
    module A3; end
    module C3
      include A3
    end
    module D3
      include A3
    end
    module E3
      include C3
      include D3
    end
     * E3.ancestors    => [E3, D3, C3, A3]
     */
    var graph, group, linearize;
    graph = LTSORT.new_graph({
      loners: false
    });
    group = function(graph) {
      return (LTSORT.group(graph)).reverse();
    };
    linearize = function(graph) {
      return (LTSORT.linearize(graph)).reverse();
    };
    LTSORT.add(graph, 'A3');
    LTSORT.add(graph, 'A3', 'C3');
    LTSORT.add(graph, 'A3', 'D3');
    LTSORT.add(graph, 'C3', 'E3');
    LTSORT.add(graph, 'C3', 'D3'); // b/c in E3, C3 is mentioned earlier than D3
    LTSORT.add(graph, 'D3', 'E3');
    debug(group(graph));
    debug(linearize(graph));
    T.eq(group(graph), [['E3'], ['D3'], ['C3'], ['A3']]);
    T.eq(linearize(graph), ['E3', 'D3', 'C3', 'A3']);
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this["Ruby inheritance linearization (2)"] = function(T, done) {
    /* patterned after *Ruby's Dark Corners* http://norswap.com/ruby-module-linearization/ */
    /*
    module A4; end
    module B4; end
    module F4; end
    module C4
      include B4
      include A4
    end
    module D4
      include F4
      include A4
    end
    module E4
      include C4
      include D4
    end
     * E4.ancestors    => [E4, D4, C4, A4, F4, B4]
     */
    var graph, group, linearize;
    graph = LTSORT.new_graph({
      loners: false
    });
    group = function(graph) {
      return (LTSORT.group(graph)).reverse();
    };
    linearize = function(graph) {
      return (LTSORT.linearize(graph)).reverse();
    };
    LTSORT.add(graph, 'A4');
    LTSORT.add(graph, 'B4');
    LTSORT.add(graph, 'F4');
    LTSORT.add(graph, 'B4', 'C4');
    LTSORT.add(graph, 'A4', 'C4');
    LTSORT.add(graph, 'B4', 'A4'); // b/c in C4, B4 is mentioned earlier than A4
    LTSORT.add(graph, 'F4', 'D4');
    LTSORT.add(graph, 'A4', 'D4');
    LTSORT.add(graph, 'F4', 'A4');
    LTSORT.add(graph, 'C4', 'E4');
    LTSORT.add(graph, 'D4', 'E4');
    LTSORT.add(graph, 'C4', 'D4');
    debug(LTSORT.get_linearity(graph));
    debug(group(graph));
    debug(linearize(graph));
    // T.eq ( group      graph ), [ [ 'E4' ], [ 'D4' ], [ 'C4' ], [ 'A4' ] ]
    T.eq(linearize(graph), ['E4', 'D4', 'C4', 'A4', 'F4', 'B4']);
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this["Ruby inheritance linearization (3)"] = function(T, done) {
    /* patterned after *Ruby's Dark Corners* http://norswap.com/ruby-module-linearization/ */
    /*
    module A5; end
    module B5; end
    module C5
      include B5
      include A5
    end
    module D5
      include A5
      include B5
    end
    module E5
      include C5
      include D5
    end

     * E5.ancestors    => [E5, D5, C5, A5, B5]
     */
    var graph, group, linearize;
    graph = LTSORT.new_graph({
      loners: false
    });
    group = function(graph) {
      return (LTSORT.group(graph)).reverse();
    };
    linearize = function(graph) {
      return (LTSORT.linearize(graph)).reverse();
    };
    LTSORT.add(graph, 'A5');
    LTSORT.add(graph, 'B5');
    LTSORT.add(graph, 'B5', 'C5');
    LTSORT.add(graph, 'A5', 'C5');
    LTSORT.add(graph, 'B5', 'A5');
    LTSORT.add(graph, 'A5', 'D5');
    LTSORT.add(graph, 'B5', 'D5');
    // LTSORT.add graph, 'A5', 'B5'
    LTSORT.add(graph, 'C5', 'E5');
    LTSORT.add(graph, 'D5', 'E5');
    LTSORT.add(graph, 'C5', 'D5');
    debug(LTSORT.get_linearity(graph));
    debug(group(graph));
    debug(linearize(graph));
    // T.eq ( group      graph ), [ [ 'E5' ], [ 'D5' ], [ 'C5' ], [ 'A5' ] ]
    // T.eq ( linearize  graph ), [ 'E5', 'D5', 'C5', 'A5', 'F5', 'B5', ]
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this.demo = function(T) {
    var element, elements, graph, i, j, k, len, len1, len2, lone_node, lone_nodes, ref, root_node, root_nodes;
    elements = this._probes['small'];
    graph = LTSORT.populate(LTSORT.new_graph({
      loners: false
    }), elements);
    ref = LTSORT.linearize(graph);
    //.........................................................................................................
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      help(element);
    }
    //.........................................................................................................
    debug(graph);
    // help LTSORT.find_root_nodes graph, no
    if (LTSORT.has_nodes(graph)) {
      if ((lone_nodes = LTSORT.find_lone_nodes(graph)).length > 0) {
        info(CND.rainbow(lone_nodes));
        for (j = 0, len1 = lone_nodes.length; j < len1; j++) {
          lone_node = lone_nodes[j];
          LTSORT.delete(graph, lone_node);
        }
      }
    }
    while (LTSORT.has_nodes(graph)) {
      root_nodes = LTSORT.find_root_nodes(graph);
      info(CND.rainbow(root_nodes));
      for (k = 0, len2 = root_nodes.length; k < len2; k++) {
        root_node = root_nodes[k];
        LTSORT.delete(graph, root_node);
      }
    }
    // debug graph
    // CND.dir LTSORT
    return null;
  };

  //===========================================================================================================
  // MAIN
  //-----------------------------------------------------------------------------------------------------------
  this._main = function(handler) {
    return test(this, {
      'timeout': 2500
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this._prune = function() {
    var name, ref, value;
    ref = this;
    for (name in ref) {
      value = ref[name];
      if (name.startsWith('_')) {
        continue;
      }
      if (indexOf.call(include, name) < 0) {
        delete this[name];
      }
    }
    return null;
  };

  //###########################################################################################################
  if (module.parent == null) {
    // "demo",
    include = ["sorting", "existence", "deletion", "root nodes, lone nodes (1)", "root nodes, lone nodes (2)", "copy (1)", "copy (2)", "group (1)", "group (2)", "group (3)", "group (4)", "test for lone node", "demo (1)", "demo (2)", "demo (3)", "demo (4)", "using precedents, actions, and consequents", "cycle detection (1)", "cycle detection (2)", "linearity (1)", "linearity (2)", "avoid reduplication", "Ruby inheritance linearization (1)", "Ruby inheritance linearization (2)", "Ruby inheritance linearization (3)"];
    this._prune();
    this._main();
  }

  // debug '\n' + JSON.stringify ( Object.keys @ ), null, '  '

}).call(this);

//# sourceMappingURL=tests.js.map