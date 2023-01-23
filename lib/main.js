(function() {
  'use strict';
  var GUY, Intertype, LTSORT, Ltsort, alert, base_types, debug, echo, get_base_types, help, info, inspect, log, plain, praise, rpr, urge, warn, whisper,
    indexOf = [].indexOf;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('LTSORT'));

  ({rpr, inspect, echo, log} = GUY.trm);

  //...........................................................................................................
  ({Intertype} = require('intertype'));

  LTSORT = require('./legacy');

  base_types = null;

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  get_base_types = function() {
    var declare;
    if (base_types != null) {
      return base_types;
    }
    //.........................................................................................................
    base_types = new Intertype();
    ({declare} = base_types);
    //.........................................................................................................
    declare.lt_nodelist('list.of.nonempty.text');
    //.........................................................................................................
    declare.lt_constructor_cfg({
      fields: {
        loners: 'boolean'
      },
      default: {
        loners: true
      }
    });
    //.........................................................................................................
    declare.lt_add_cfg({
      fields: {
        name: 'nonempty.text',
        before: 'lt_nodelist',
        after: 'lt_nodelist'
      },
      default: {
        name: null,
        before: null,
        after: null
      },
      create: function(x) {
        var R;
        R = x != null ? x : {};
        if (!this.isa.object(R)) {
          return R;
        }
        if (R.after == null) {
          R.after = [];
        }
        if (R.before == null) {
          R.before = [];
        }
        if (!this.isa.list(R.after)) {
          R.after = [R.after];
        }
        if (!this.isa.list(R.before)) {
          R.before = [R.before];
        }
        return R;
      }
    });
    //.........................................................................................................
    declare.lt_linearize_cfg({
      fields: {
        groups: 'boolean'
      },
      default: {
        groups: false
      }
    });
    //.........................................................................................................
    return base_types;
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  Ltsort = class Ltsort {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      GUY.props.hide(this, 'types', get_base_types());
      this.cfg = this.types.create.lt_constructor_cfg(cfg);
      GUY.props.hide(this, 'topograph', LTSORT.new_graph(this.cfg));
      GUY.props.hide(this, 'antecedents', []);
      GUY.props.hide(this, 'subsequents', []);
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    add(cfg) {
      var i, j, len, len1, ref, ref1, ref2, ref3, relative;
      cfg = this.types.create.lt_add_cfg(cfg);
      if ((cfg.before.length === 0) && (cfg.after.length === 0)) {
        LTSORT.add(this.topograph, cfg.name);
        return null;
      }
      ref = cfg.after;
      for (i = 0, len = ref.length; i < len; i++) {
        relative = ref[i];
        if (relative === '*') {
          if (ref1 = cfg.name, indexOf.call(this.subsequents, ref1) < 0) {
            this.subsequents.push(cfg.name);
          }
          continue;
        }
        LTSORT.add(this.topograph, relative, cfg.name);
      }
      ref2 = cfg.before;
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        relative = ref2[j];
        if (relative === '*') {
          if (ref3 = cfg.name, indexOf.call(this.antecedents, ref3) < 0) {
            this.antecedents.push(cfg.name);
          }
          continue;
        }
        LTSORT.add(this.topograph, cfg.name, relative);
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _finalize() {
      var antecedent, i, idx, j, k, l, len, len1, len2, len3, name, names, ref, ref1, ref2, ref3, subsequent;
      if ((this.antecedents.length === 0) && (this.subsequents.length === 0)) {
        return null;
      }
      names = [...this.topograph.precedents.keys()];
      ref = this.subsequents;
      //.......................................................................................................
      /* after: '*' */
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        subsequent = ref[idx];
        ref1 = [...names, ...this.subsequents.slice(0, idx), ...this.antecedents];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          name = ref1[j];
          if (subsequent === name) {
            continue;
          }
          LTSORT.add(this.topograph, name, subsequent);
        }
      }
      ref2 = this.antecedents;
      //.......................................................................................................
      /* before: '*' */
      for (idx = k = 0, len2 = ref2.length; k < len2; idx = ++k) {
        antecedent = ref2[idx];
        urge('^98-1^', {antecedent, idx});
        ref3 = [...names, ...this.antecedents.slice(0, idx), ...this.subsequents];
        for (l = 0, len3 = ref3.length; l < len3; l++) {
          name = ref3[l];
          debug('^98-1^', name, this.topograph.precedents.get(name));
          if (antecedent === name) {
            continue;
          }
          LTSORT.add(this.topograph, antecedent, name);
        }
      }
      //.......................................................................................................
      // @antecedents.length = 0
      // @subsequents.length = 0
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    linearize(cfg) {
      cfg = this.types.create.lt_linearize_cfg(cfg);
      this._finalize();
      if (cfg.groups) {
        return LTSORT.group(this.topograph);
      }
      return LTSORT.linearize(this.topograph);
    }

  };

  // #===========================================================================================================
  // #
  // #-----------------------------------------------------------------------------------------------------------
  // show = ( topograph ) ->
  //   LTSORT                    = require '../../../apps/ltsort'
  //   try dependencies = LTSORT.group topograph catch error
  //     throw error unless ( error.message.match /detected cycle involving node/ )?
  //     warn GUY.trm.reverse error.message
  //     warn '^08-1^', GUY.trm.reverse error.message
  //     # throw new DBay_sqlm_circular_references_error '^dbay/dbm@4^', name, ref_name
  //   info '^08-2^', dependencies
  //   try ordering = LTSORT.linearize topograph catch error
  //     throw error unless ( error.message.match /detected cycle involving node/ )?
  //     warn '^08-3^', GUY.trm.reverse error.message
  //     # throw new DBay_sqlm_circular_references_error '^dbay/dbm@4^', name, ref_name
  //   table = []
  //   for [ name, precedents, ] from topograph.precedents.entries()
  //     precedents = precedents.join ', '
  //     table.push { name, precedents, }
  //   H.tabulate "topograph", table
  //   info '^08-4^', ( GUY.trm.yellow x for x in ordering ).join GUY.trm.grey ' => '
  //   return null

  //===========================================================================================================
  module.exports = {Ltsort};

}).call(this);

//# sourceMappingURL=main.js.map