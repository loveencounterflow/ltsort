(function() {
  'use strict';
  var CT, GUY, LTSORT, Ltsort, get_lt_types, lt_types, std,
    indexOf = [].indexOf;

  //###########################################################################################################
  GUY = require('guy');

  // { debug }                 = GUY.trm.get_loggers 'LTSORT'
  // { rpr }                   = GUY.trm
  //...........................................................................................................
  ({CT, std} = require('cleartype'));

  LTSORT = require('./legacy');

  lt_types = null;

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  get_lt_types = function() {
    if (lt_types != null) {
      return lt_types;
    }
    //.........................................................................................................
    lt_types = {
      //.......................................................................................................
      lt_nodelist: {
        $isa: function(x) {
          if (!this.ct.isa(std.list, x)) {
            // 'list.of.nonempty.text'
            return false;
          }
          return x.every((e) => {
            return this.ct.isa(std.nonempty_text, e);
          });
        },
        $create: function(x) {
          if (x != null) {
            return x;
          }
          return [];
        }
      },
      //.......................................................................................................
      lt_constructor_cfg: {
        $isa: function(x) {
          if (!this.ct.isa(std.object, x)) {
            return false;
          }
          if (!this.ct.isa(this.me.loners, x.loners)) {
            return false;
          }
          return true;
        },
        loners: {
          $isa: function(x) {
            return this.ct.isa(std.boolean, x);
          }
        },
        $template: {
          loners: true
        },
        $create: function(x) {
          if (!this.ct.isa_optional(std.object, x)) {
            return x;
          }
          return {...this.me.$template, ...x};
        }
      },
      //.......................................................................................................
      lt_add_cfg: {
        $isa: function(x) {
          if (!this.ct.isa(std.object, x)) {
            return false;
          }
          if (!this.ct.isa(this.me.name, x.name)) {
            return false;
          }
          if (!this.ct.isa(this.me.precedes, x.precedes)) {
            return false;
          }
          if (!this.ct.isa(this.me.needs, x.needs)) {
            return false;
          }
          return true;
        },
        $create: function(x) {
          var R;
          if (!this.ct.isa_optional(std.object, x)) {
            return x;
          }
          R = {
            ...this.me.$template,
            precedes: [],
            needs: [],
            ...x
          };
          if (this.ct.isa(std.text, R.needs)) {
            R.needs = [R.needs];
          }
          if (this.ct.isa(std.text, R.precedes)) {
            R.precedes = [R.precedes];
          }
          return R;
        },
        //.....................................................................................................
        name: {
          $isa: function(x) {
            return this.ct.isa(std.nonempty_text, x);
          }
        },
        precedes: {
          $isa: function(x) {
            return this.ct.isa_optional(lt_types.lt_nodelist, x);
          }
        },
        needs: {
          $isa: function(x) {
            return this.ct.isa_optional(lt_types.lt_nodelist, x);
          }
        },
        $template: {
          name: null,
          precedes: null,
          needs: null
        }
      },
      //.......................................................................................................
      lt_linearize_cfg: {
        $isa: function(x) {
          if (!this.ct.isa(std.object, x)) {
            return false;
          }
          if (!this.ct.isa(this.me.groups, x.groups)) {
            return false;
          }
          return true;
        },
        $create: function(x) {
          if (!this.ct.isa_optional(std.object, x)) {
            return x;
          }
          return {...this.me.$template, ...x};
        },
        //.....................................................................................................
        groups: {
          $isa: function(x) {
            return this.ct.isa(std.boolean, x);
          }
        },
        $template: {
          groups: false
        }
      }
    };
    //.........................................................................................................
    return lt_types;
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  Ltsort = class Ltsort {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      GUY.props.hide(this, 'lt_types', get_lt_types());
      this.cfg = CT.create(this.lt_types.lt_constructor_cfg, cfg);
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
      cfg = CT.create(this.lt_types.lt_add_cfg, cfg);
      //.......................................................................................................
      if ((cfg.precedes.length === 0) && (cfg.needs.length === 0)) {
        return this._register(cfg.name);
      }
      //.......................................................................................................
      relatives = this._get_relatives(cfg.name, cfg.needs);
      if (relatives.length === 0) {
        this._register(cfg.name);
      } else {
        for (i = 0, len = relatives.length; i < len; i++) {
          relative = relatives[i];
          this._add(relative, cfg.name);
        }
      }
      //.......................................................................................................
      relatives = this._get_relatives(cfg.name, cfg.precedes);
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
      cfg = CT.create(this.lt_types.lt_linearize_cfg, cfg);
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