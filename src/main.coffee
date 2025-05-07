
'use strict'


############################################################################################################
GUY                       = require 'guy'
# { debug }                 = GUY.trm.get_loggers 'LTSORT'
# { rpr }                   = GUY.trm
#...........................................................................................................
{ Intertype }             = require 'intertype'
LTSORT                    = require './legacy'
base_types                = null


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
get_base_types = ->
  return base_types if base_types?
  #.........................................................................................................
  base_types                = new Intertype()
  { declare }               = base_types
  #.........................................................................................................
  declare.lt_nodelist 'list.of.nonempty.text'
  #.........................................................................................................
  declare.lt_constructor_cfg
    fields:
      loners:     'boolean'
    default:
      loners:     true
  #.........................................................................................................
  declare.lt_add_cfg
    fields:
      name:       'nonempty.text'
      precedes:   'lt_nodelist'
      needs:      'lt_nodelist'
    default:
      name:       null
      precedes:     null
      needs:      null
    create: ( x ) ->
      R           = x ? {}
      return R unless @isa.object R
      R.needs    ?= []
      R.precedes   ?= []
      R.needs       = [ R.needs,    ] unless @isa.list R.needs
      R.precedes    = [ R.precedes, ] unless @isa.list R.precedes
      return R
  #.........................................................................................................
  declare.lt_linearize_cfg
    fields:
      groups:     'boolean'
    default:
      groups:     false
  #.........................................................................................................
  return base_types


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
class Ltsort

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    GUY.props.hide @, 'types', get_base_types()
    @cfg = @types.create.lt_constructor_cfg cfg
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
    cfg = @types.create.lt_add_cfg cfg
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
    cfg = @types.create.lt_linearize_cfg cfg
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



