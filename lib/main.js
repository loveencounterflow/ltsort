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
      GUY.props.hide(this, 'precedents', {});
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _get_relatives(name, relatives) {
      var relative;
      if (indexOf.call(relatives, '*') >= 0) {
        return (function() {
          var results;
          results = [];
          for (relative in this.precedents) {
            if (relative !== name) {
              results.push(relative);
            }
          }
          return results;
        }).call(this);
      }
      return relatives;
    }

    //---------------------------------------------------------------------------------------------------------
    add(cfg) {
      var i, j, len, len1, relative, relatives;
      cfg = this.types.create.lt_add_cfg(cfg);
      //.......................................................................................................
      if ((cfg.before.length === 0) && (cfg.after.length === 0)) {
        return this._register(cfg.name);
      }
      //.......................................................................................................
      relatives = this._get_relatives(cfg.name, cfg.after);
      if (relatives.length === 0) {
        this._register(cfg.name);
      } else {
        for (i = 0, len = relatives.length; i < len; i++) {
          relative = relatives[i];
          this._add(relative, cfg.name);
        }
      }
      //.......................................................................................................
      relatives = this._get_relatives(cfg.name, cfg.before);
      if (relatives.length === 0) {
        this._register(cfg.name);
      } else {
        for (j = 0, len1 = relatives.length; j < len1; j++) {
          relative = relatives[j];
          this._add(cfg.name, relative);
        }
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _register(name) {
      var base;
      if ((base = this.precedents)[name] == null) {
        base[name] = [];
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _add(name, precedent) {
      this._register(name);
      this._register(precedent);
      this.precedents[name].push(precedent);
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _finalize() {
      var i, len, name, precedent, precedents, ref;
      LTSORT.clear(this.topograph);
      ref = this.precedents;
      //.......................................................................................................
      for (name in ref) {
        precedents = ref[name];
        LTSORT.add(this.topograph, name);
        for (i = 0, len = precedents.length; i < len; i++) {
          precedent = precedents[i];
          LTSORT.add(this.topograph, name, precedent);
        }
      }
      //.......................................................................................................
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