
'use strict'


############################################################################################################
GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'LTSORT'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
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
      before:     'lt_nodelist'
      after:      'lt_nodelist'
    default:
      name:       null
      before:     null
      after:      null
    create: ( x ) ->
      R           = x ? {}
      return R unless @isa.object R
      R.after    ?= []
      R.before   ?= []
      R.after     = [ R.after,  ] unless @isa.list R.after
      R.before    = [ R.before, ] unless @isa.list R.before
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
    @cfg        = @types.create.lt_constructor_cfg cfg
    GUY.props.hide @, 'topograph', LTSORT.new_graph @cfg
    GUY.props.hide @, 'precedents',  {}
    GUY.props.hide @, 'antecedents', []
    GUY.props.hide @, 'subsequents', []
    return undefined

  #---------------------------------------------------------------------------------------------------------
  add: ( cfg ) ->
    cfg = @types.create.lt_add_cfg cfg
    #.......................................................................................................
    if ( cfg.before.length is 0 ) and ( cfg.after.length is 0 )
      return @_register cfg.name
    #.......................................................................................................
    for relative in cfg.after
      if relative is '*'
        @subsequents.push cfg.name unless cfg.name in @subsequents
        continue
      @_add 'after', cfg.name, relative
    #.......................................................................................................
    for relative in cfg.before
      if relative is '*'
        @antecedents.push cfg.name unless cfg.name in @antecedents
        continue
      @_add 'before', relative, cfg.name
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  _register: ( name ) ->
    @precedents[ name ] ?= []
    return null

  #---------------------------------------------------------------------------------------------------------
  _add: ( position, name, precedent ) ->
    if position is 'before'
      if      ( idx = @antecedents.indexOf name      ) > -1 then return @antecedents.splice idx + 1, 0, precedent
      else if ( idx = @antecedents.indexOf precedent ) > -1 then return @antecedents.splice idx + 0, 0, name
      else if ( idx = @subsequents.indexOf precedent ) > -1 then return @subsequents.splice idx + 1, 0, name
      else if ( idx = @subsequents.indexOf name      ) > -1 then return @subsequents.splice idx + 0, 0, precedent
    else
      if      ( idx = @antecedents.indexOf name      ) > -1 then return @antecedents.splice idx + 1, 0, precedent
      else if ( idx = @antecedents.indexOf precedent ) > -1 then return @antecedents.splice idx + 0, 0, name
      else if ( idx = @subsequents.indexOf precedent ) > -1 then return @subsequents.splice idx + 1, 0, name
      else if ( idx = @subsequents.indexOf name      ) > -1 then return @subsequents.splice idx + 0, 0, precedent
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
    return null if ( @antecedents.length is 0 ) and ( @subsequents.length is 0 )
    names = [ @topograph.precedents.keys()..., ]
    #.......................................................................................................
    ### after: '*' ###
    for subsequent, idx in @subsequents
      for name in [ names..., @subsequents[ ... idx ]..., @antecedents..., ]
        continue if subsequent is name
        LTSORT.add @topograph, name, subsequent
    #.......................................................................................................
    ### before: '*' ###
    for antecedent, idx in @antecedents
      for name in [ names..., @antecedents[ ... idx ]..., @subsequents..., ]
        continue if antecedent is name
        LTSORT.add @topograph, antecedent, name
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



