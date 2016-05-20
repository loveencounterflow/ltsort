

############################################################################################################
njs_util                  = require 'util'
njs_path                  = require 'path'
njs_fs                    = require 'fs'
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'LTSORT'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND


### Adapted from https://github.com/eknkc/tsort ###


#-----------------------------------------------------------------------------------------------------------
@new_graph = ( settings ) ->
  settings ?= {}
  R =
    '~isa':       'CND/tsort-graph'
    'precedents': new Map()
    'loners':     settings[ 'loners' ] ? yes
  return R

#-----------------------------------------------------------------------------------------------------------
@_link = ( me, precedent, consequent ) ->
  @_register me, precedent
  @_register me, consequent
  ( me[ 'precedents' ].get consequent ).push precedent
  return me

#-----------------------------------------------------------------------------------------------------------
@_register = ( me, name ) ->
  me[ 'precedents' ].set name, [] unless ( target = me[ 'precedents' ].get name )?
  return me

#-----------------------------------------------------------------------------------------------------------
@_get_precedents = ( me, name ) ->
  unless ( R = me[ 'precedents' ].get name )?
    throw new Error "unknown node #{rpr name}"
  return R

#-----------------------------------------------------------------------------------------------------------
@delete = ( me, name ) ->
  precedents = @_get_precedents me, name
  throw new Error "unable to remove non-root node #{rpr name}" unless precedents.length is 0
  me[ 'precedents' ].delete name
  for precedents in Array.from me[ 'precedents' ].values()
    for idx in [ precedents.length - 1 .. 0 ] by -1
      continue unless precedents[ idx ] is name
      precedents.splice idx, 1
  return null

#-----------------------------------------------------------------------------------------------------------
@find_root_nodes = ( me, loners = null ) ->
  if loners ? me[ 'loners' ]
    test = ( name ) => not @_has_precedents me, name
  else
    test = ( name ) => ( not @_has_precedents me, name ) and ( @_is_precedent me, name )
  return ( name for name in ( Array.from me[ 'precedents' ].keys() ) when test name )

#-----------------------------------------------------------------------------------------------------------
@_has_precedents = ( me, name ) ->
  return ( @_get_precedents me, name ).length > 0

#-----------------------------------------------------------------------------------------------------------
@_is_precedent = ( me, name ) ->
  for precedents in Array.from me[ 'precedents' ].values()
    return true if ( precedents.indexOf name ) >= 0
  return false

#-----------------------------------------------------------------------------------------------------------
@find_lone_nodes = ( me, root_nodes = null ) ->
  R = []
  for name in ( root_nodes ? @find_root_nodes me, yes )
    R.push name unless @_is_precedent me, name
  return R

#-----------------------------------------------------------------------------------------------------------
@has_node = ( me, name ) ->
  return me[ 'precedents' ].has name

#-----------------------------------------------------------------------------------------------------------
@has_nodes = ( me ) ->
  return me[ 'precedents' ].size > 0

#-----------------------------------------------------------------------------------------------------------
@add = ( me, lhs, relation = null, rhs = null ) ->
  switch relation
    when '>' then return @_link me, lhs, rhs
    when '<' then return @_link me, rhs, lhs
    when null
      throw new Error "no relation given" if rhs?
      return @_register me, lhs
    else
      throw new Error "expected '<' or '>' for relation argument, got #{CND.rpr relation}"
  return null

#-----------------------------------------------------------------------------------------------------------
@_visit = ( me, results, marks, name ) ->
  throw new Error "detected cycle involving node #{rpr name}" if marks[ name ] is 'visiting'
  return null if marks[ name ]?
  #.......................................................................................................
  marks[ name ] = 'visiting'
  #.......................................................................................................
  for precedent in @_get_precedents me, name
    @_visit me, results, marks, precedent
  #.......................................................................................................
  marks[ name ] = 'ok'
  results.push name
  return null

#-----------------------------------------------------------------------------------------------------------
@linearize = ( me ) ->
  ### As given in http://en.wikipedia.org/wiki/Topological_sorting ###
  consequents     = Array.from me[ 'precedents' ].keys()
  R               = []
  marks           = {}
  #.........................................................................................................
  for consequent in consequents
    @_visit me, R, marks, consequent unless marks[ consequent ]?
  #.........................................................................................................
  return R

