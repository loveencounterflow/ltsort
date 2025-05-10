
'use strict'


############################################################################################################
GUY                       = require 'guy'
# { debug }                 = GUY.trm.get_loggers 'LTSORT'
# { rpr }                   = GUY.trm
#...........................................................................................................
{ CT, \
  std                 }   = require 'cleartype'
LTSORT                    = require './legacy'
lt_types                  = null


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
get_lt_types = ->
  return lt_types if lt_types?
  #.........................................................................................................
  lt_types =
    #.......................................................................................................
    lt_nodelist:
      $isa: ( x ) ->
        # 'list.of.nonempty.text'
        return false unless @ct.isa std.list, x
        return x.every ( e ) => @ct.isa std.nonempty_text, e
      $create: ( x ) ->
        return x if x?
        return []
    #.......................................................................................................
    lt_constructor_cfg:
      $isa: ( x ) ->
        return false unless @ct.isa std.object, x
        return false unless @ct.isa @me.loners, x.loners
        return true
      loners:
        $isa:       ( x ) -> @ct.isa std.boolean, x
      $template:
        loners:     true
      $create: ( x ) ->
        return x unless @ct.isa_optional std.object, x
        return { @me.$template..., x..., }
    #.......................................................................................................
    lt_add_cfg:
      $isa: ( x ) ->
        return false unless @ct.isa std.object,   x
        return false unless @ct.isa @me.name,     x.name
        return false unless @ct.isa @me.precedes, x.precedes
        return false unless @ct.isa @me.needs,    x.needs
        return true
      $create: ( x ) ->
        return x unless @ct.isa_optional std.object, x
        R           = { @me.$template..., precedes: [], needs: [], x..., }
        R.needs     = [ R.needs,    ] if @ct.isa std.text, R.needs
        R.precedes  = [ R.precedes, ] if @ct.isa std.text, R.precedes
        return R
      #.....................................................................................................
      name:         $isa: ( x ) -> @ct.isa std.nonempty_text,             x
      precedes:     $isa: ( x ) -> @ct.isa_optional lt_types.lt_nodelist, x
      needs:        $isa: ( x ) -> @ct.isa_optional lt_types.lt_nodelist, x
      $template:
        name:       null
        precedes:   null
        needs:      null
    #.......................................................................................................
    lt_linearize_cfg:
      $isa: ( x ) ->
        return false unless @ct.isa std.object, x
        return false unless @ct.isa @me.groups, x.groups
        return true
      $create: ( x ) ->
        return x unless @ct.isa_optional std.object, x
        return { @me.$template..., x..., }
      #.....................................................................................................
      groups:
        $isa:       ( x ) -> @ct.isa std.boolean, x
      $template:
        groups:     false
  #.........................................................................................................
  return lt_types


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
class Ltsort

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    GUY.props.hide @, 'lt_types', get_lt_types()
    @cfg = CT.create @lt_types.lt_constructor_cfg, cfg
    GUY.props.hide @, 'topograph', LTSORT.new_graph @cfg
    GUY.props.hide @, 'precedents',  {}
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _get_relatives: ( name, relatives ) ->
    if '*' in relatives
      return ( relative for relative of @precedents when relative isnt name )
    return relatives

  #---------------------------------------------------------------------------------------------------------
  add: ( cfg ) ->
    cfg = CT.create @lt_types.lt_add_cfg, cfg
    #.......................................................................................................
    if ( cfg.precedes.length is 0 ) and ( cfg.needs.length is 0 )
      return @_register cfg.name
    #.......................................................................................................
    relatives = @_get_relatives cfg.name, cfg.needs
    if relatives.length is 0
      @_register cfg.name
    else
      @_add relative, cfg.name for relative in relatives
    #.......................................................................................................
    relatives = @_get_relatives cfg.name, cfg.precedes
    if relatives.length is 0
      @_register cfg.name
    else
      @_add cfg.name, relative for relative in relatives
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  _register: ( name ) ->
    @precedents[ name ] ?= []
    return null

  #---------------------------------------------------------------------------------------------------------
  _add: ( name, precedent ) ->
    @_register name
    @_register precedent
    @precedents[ name ].push precedent
    return null

  #---------------------------------------------------------------------------------------------------------
  _finalize: ->
    LTSORT.clear @topograph
    #.......................................................................................................
    for name, precedents of @precedents
      LTSORT.add @topograph, name
      LTSORT.add @topograph, name, precedent for precedent in precedents
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  linearize: ( cfg ) ->
    cfg = CT.create @lt_types.lt_linearize_cfg, cfg
    @_finalize()
    return LTSORT.group @topograph if cfg.groups
    return LTSORT.linearize @topograph




# #===========================================================================================================
# #
# #-----------------------------------------------------------------------------------------------------------
# show = ( topograph ) ->
#   LTSORT                    = require '../../../apps/ltsort'
#   try dependencies = LTSORT.group topograph catch error
#     throw error unless ( error.message.match /detected cycle involving node/ )?
#     warn GUY.trm.reverse error.message
#     warn '^08-1^', GUY.trm.reverse error.message
#     # throw new DBay_sqlm_circular_references_error '^dbay/dbm@4^', name, ref_name
#   info '^08-2^', dependencies
#   try ordering = LTSORT.linearize topograph catch error
#     throw error unless ( error.message.match /detected cycle involving node/ )?
#     warn '^08-3^', GUY.trm.reverse error.message
#     # throw new DBay_sqlm_circular_references_error '^dbay/dbm@4^', name, ref_name
#   table = []
#   for [ name, precedents, ] from topograph.precedents.entries()
#     precedents = precedents.join ', '
#     table.push { name, precedents, }
#   H.tabulate "topograph", table
#   info '^08-4^', ( GUY.trm.yellow x for x in ordering ).join GUY.trm.grey ' => '
#   return null


#===========================================================================================================
module.exports = { Ltsort, }



