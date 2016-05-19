

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
    'precedents': {}
    'loners':     settings[ 'loners' ] ? yes
  return R

#-----------------------------------------------------------------------------------------------------------
@_link = ( me, precedence, consequence ) ->
  ### TAINT check for trivial errors such as precedence == consequence ###
  me[ 'precedents' ][ precedence ]?= []
  ( me[ 'precedents' ][ consequence ]?= [] ).push precedence
  return me

#-----------------------------------------------------------------------------------------------------------
@_register = ( me, name ) ->
  me[ 'precedents' ][ name ]?= []
  return me

#-----------------------------------------------------------------------------------------------------------
@delete = ( me, name ) ->
  throw new Error "unknown node #{rpr name}"                   unless name of me[ 'precedents' ]
  throw new Error "unable to remove non-root node #{rpr name}" unless me[ 'precedents' ][ name ].length is 0
  delete me[ 'precedents' ][ name ]
  for consequence, precedences of me[ 'precedents' ]
    for idx in [ precedences.length - 1 .. 0 ] by -1
      continue unless precedences[ idx ] is name
      precedences.splice idx, 1
  return null

#-----------------------------------------------------------------------------------------------------------
@find_root_nodes = ( me, loners = null ) ->
  if loners ? me[ 'loners' ]
    test = ( name ) => not @_has_precedences me, name
  else
    test = ( name ) => ( not @_has_precedences me, name ) and ( @_is_precedence me, name )
  return ( name for name of me[ 'precedents' ] when test name )

#-----------------------------------------------------------------------------------------------------------
@_has_precedences = ( me, name ) ->
  return me[ 'precedents' ][ name ].length > 0

#-----------------------------------------------------------------------------------------------------------
@_is_precedence = ( me, name ) ->
  for _, precedences of me[ 'precedents' ]
    return true if ( precedences.indexOf name ) >= 0
  return false

#-----------------------------------------------------------------------------------------------------------
@find_lone_nodes = ( me, root_nodes = null ) ->
  R = []
  for name in ( root_nodes ? @find_root_nodes me, yes )
    R.push name unless @_is_precedence me, name
  return R

#-----------------------------------------------------------------------------------------------------------
@has_node = ( me, name ) ->
  return name of me[ 'precedents' ]

#-----------------------------------------------------------------------------------------------------------
@has_nodes = ( me ) ->
  return ( Object.keys me[ 'precedents' ] ).length > 0

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
  throw new Error "detected cycle involving node #{CND.rpr name}" if marks[ name ] is 'temp'
  return null if marks[ name ]?
  #.......................................................................................................
  marks[ name ] = 'temp'
  #.......................................................................................................
  for sub_name in me[ 'precedents' ][ name ]
    @_visit me, results, marks, sub_name
    # urge '2234', name, sub_name
  #.......................................................................................................
  marks[ name ] = 'ok'
  results.push name
  return null

#-----------------------------------------------------------------------------------------------------------
@linearize = ( me ) ->
  ### As given in http://en.wikipedia.org/wiki/Topological_sorting ###
  precedences     = Object.keys me[ 'precedents' ]
  R               = []
  marks           = {}
  #.........................................................................................................
  for precedence in precedences
    # debug '4432', precedence
    @_visit me, R, marks, precedence unless marks[ precedence ]?
  # debug counts
  #.........................................................................................................
  return R

