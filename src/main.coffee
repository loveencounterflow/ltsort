
'use strict'

### Adapted from https://github.com/eknkc/tsort ###

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
@types                    = new ( require 'intertype' ).Intertype()
{ isa }                   = @types.export()


#-----------------------------------------------------------------------------------------------------------
@new_graph = ( settings ) ->
  return @_copy settings if ( isa.object settings ) and ( settings[ '~isa' ] is 'LTSORT/graph' )
  settings ?= {}
  R =
    '~isa':       'LTSORT/graph'
    'precedents': new Map()
    'loners':     settings[ 'loners' ] ? yes
  return R

#-----------------------------------------------------------------------------------------------------------
@_copy = ( me ) ->
  R = @new_graph { loners: me[ 'loners' ], }
  for [ name, precedents, ] in Array.from me[ 'precedents' ].entries()
    R[ 'precedents' ].set name, ( precedent for precedent in precedents )
  return R

#-----------------------------------------------------------------------------------------------------------
@populate = ( me, elements ) ->
  #.........................................................................................................
  for element in elements
    if isa.text element
      @add me, element
    else
      [ a, b, ] = element
      @add me, a, b
  #.........................................................................................................
  return me

#-----------------------------------------------------------------------------------------------------------
@_link = ( me, precedent, consequent ) ->
  @_register me, precedent
  @_register me, consequent
  target = me[ 'precedents' ].get consequent
  target.push precedent unless precedent in target
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
@_has_precedents = ( me, name ) ->
  return ( @_get_precedents me, name ).length > 0

#-----------------------------------------------------------------------------------------------------------
@_is_precedent = ( me, name ) ->
  for precedents in Array.from me[ 'precedents' ].values()
    return true if ( precedents.indexOf name ) >= 0
  return false

#-----------------------------------------------------------------------------------------------------------
@find_root_nodes = ( me, loners = null ) ->
  if loners ? me[ 'loners' ]
    test = ( name ) => not @_has_precedents me, name
  else
    test = ( name ) => ( not @_has_precedents me, name ) and ( @_is_precedent me, name )
  return ( name for name in ( Array.from me[ 'precedents' ].keys() ) when test name )

#-----------------------------------------------------------------------------------------------------------
@find_lone_nodes = ( me, root_nodes = null ) ->
  R = []
  for name in ( root_nodes ? @find_root_nodes me, yes )
    R.push name unless @_is_precedent me, name
  return R

#-----------------------------------------------------------------------------------------------------------
@is_lone_node = ( me, name ) ->
  return ( not @_is_precedent me, name ) and ( not @_has_precedents me, name )

#-----------------------------------------------------------------------------------------------------------
@has_node = ( me, name ) ->
  return me[ 'precedents' ].has name

#-----------------------------------------------------------------------------------------------------------
@has_nodes = ( me ) ->
  return me[ 'precedents' ].size > 0

#-----------------------------------------------------------------------------------------------------------
@add = ( me, precedent, consequent = null ) ->
  return @_link me, precedent, consequent if consequent?
  return @_register me, precedent

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

#-----------------------------------------------------------------------------------------------------------
@group = ( me, loners = null ) ->
  @linearize me
  you     = @new_graph me
  loners  = loners ? me[ 'loners' ]
  R       = []
  #.........................................................................................................
  if loners
    if @has_nodes you
      lone_nodes = @find_lone_nodes you
      R.push lone_nodes
      @delete you, lone_node for lone_node in lone_nodes
  #.........................................................................................................
  while @has_nodes you
    root_nodes = @find_root_nodes you, yes
    R.push root_nodes
    @delete you, root_node for root_node in root_nodes
  #.........................................................................................................
  return R

#-----------------------------------------------------------------------------------------------------------
@get_linearity = ( me ) ->
  ### Linearity of a given dependency graph measures how well the dependency relations in a graph
  determine an ordering of its nodes. For a graph that defines a unique, single chain of antecedents and
  consequents, linearity will be 1; for a graph that defines only nodes and no dependency edges, linearity
  will be zero; for all other kind of graphs, linearity will be the inverse of the average group length.
  The linearity of all graphs with a single element is 1. The linearity of the emtpy graph is also 1, since
  that is the limit that is approached taking ever more nodes out of maximally linear as well as out of
  minimally linear (parallel-only) graphs. ###
  [ group_count, node_count, ] = @_get_group_and_node_count me
  return group_count / node_count

#-----------------------------------------------------------------------------------------------------------
@_get_group_and_node_count = ( me ) ->
  throw new Error "linearity not implemented for graphs with loners" if me[ 'loners' ]
  groups      = @group me
  group_count = groups.length
  return [ 1, 1, ] if group_count is 0
  node_count  = 0
  node_count += group.length for group in groups
  return [ group_count, node_count, ]

#-----------------------------------------------------------------------------------------------------------
@get_normal_linearity = ( me ) ->
  [ group_count, node_count, ]  = @_get_group_and_node_count me
  return 1 if group_count == node_count == 1
  minimum                       = 1 / node_count
  shrink                        = 1 - minimum
  return ( ( group_count / node_count ) - minimum ) / shrink



