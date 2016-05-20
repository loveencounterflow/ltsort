



############################################################################################################
njs_path                  = require 'path'
# njs_fs                    = require 'fs'
join                      = njs_path.join
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'LTSORT/tests'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
test                      = require 'guy-test'
LTSORT                    = require './main'


#===========================================================================================================
# DATA
#-----------------------------------------------------------------------------------------------------------
@_probes =
  'extended': [
    [ 'A', 'X', ]
    [ 'B', 'X', ]
    'F'
    [ 'X', 'Y', ]
    [ 'X', 'Z', ]
    [ 'γ', 'B', ]
    [ 'Z', 'Ψ', ]
    # [ 'Ψ', 'Ω', ]
    [ 'Z', 'Ω', ]
    [ 'β', 'A', ]
    [ 'α', 'β', ]
    ]
  #.........................................................................................................
  'small': [
    [ 'A', 'X', ]
    [ 'B', 'X', ]
    'F'
    [ 'X', 'Y', ]
    [ 'X', 'Z', ]
    ]

#===========================================================================================================
# TESTS
#-----------------------------------------------------------------------------------------------------------
@[ "sorting" ] = ( T ) ->
  elements  = @_probes[ 'extended' ]
  graph     = LTSORT.populate LTSORT.new_graph(), elements
  probe     = LTSORT.linearize graph
  #.........................................................................................................
  for element in elements
    continue if CND.isa_text element
    [ a, b, ] = element
    T.ok ( a_idx = probe.indexOf a ) >= 0
    T.ok ( b_idx = probe.indexOf b ) >= 0
    T.ok a_idx < b_idx
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "existence" ] = ( T ) ->
  elements  = @_probes[ 'extended' ]
  graph     = LTSORT.populate LTSORT.new_graph(), elements
  #.........................................................................................................
  for element in elements
    if CND.isa_text element
      T.ok LTSORT.has_node graph, element
    else
      [ a, b, ] = element
      T.ok LTSORT.has_node graph, a
      T.ok LTSORT.has_node graph, b
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "deletion" ] = ( T ) ->
  elements  = @_probes[ 'small' ]
  graph     = LTSORT.populate LTSORT.new_graph(), elements
  #.........................................................................................................
  T.ok LTSORT.has_node graph, 'A'
  LTSORT.delete graph, 'A'
  T.ok not LTSORT.has_node graph, 'A'
  #.........................................................................................................
  T.throws "unknown node 'XXX'", ( => LTSORT.delete graph, 'XXX' )
  T.throws "unable to remove non-root node 'X'", ( => LTSORT.delete graph, 'X' )
  #.........................................................................................................
  T.ok LTSORT.has_node graph, 'B'
  LTSORT.delete graph, 'B'
  T.ok not LTSORT.has_node graph, 'B'
  #.........................................................................................................
  T.ok LTSORT.has_node graph, 'X'
  LTSORT.delete graph, 'X'
  T.ok not LTSORT.has_node graph, 'X'
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "root nodes, lone nodes (1)" ] = ( T ) ->
  #.........................................................................................................
  elements  = @_probes[ 'small' ]
  graph     = LTSORT.populate LTSORT.new_graph(), elements
  #.........................................................................................................
  for element in elements
    if CND.isa_text element
      LTSORT.add graph, element
    else
      [ a, b, ] = element
      LTSORT.add graph, a, '>', b
  #.........................................................................................................
  T.eq ( LTSORT.find_root_nodes graph ),        [ 'A', 'B', 'F' ]
  T.eq ( LTSORT.find_root_nodes graph, true ),  [ 'A', 'B', 'F' ]
  T.eq ( LTSORT.find_root_nodes graph, false ), [ 'A', 'B' ]
  T.eq ( LTSORT.find_lone_nodes graph ),        [ 'F' ]
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "root nodes, lone nodes (2)" ] = ( T ) ->
  elements  = @_probes[ 'small' ]
  graph     = LTSORT.populate ( LTSORT.new_graph loners: no ), elements
  #.........................................................................................................
  T.eq ( LTSORT.find_root_nodes graph ),        [ 'A', 'B', ]
  T.eq ( LTSORT.find_root_nodes graph, true ),  [ 'A', 'B', 'F' ]
  T.eq ( LTSORT.find_root_nodes graph, false ), [ 'A', 'B' ]
  T.eq ( LTSORT.find_lone_nodes graph ),        [ 'F' ]
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "copy (1)" ] = ( T ) ->
  elements  = @_probes[ 'small' ]
  graph_0   = LTSORT.populate ( LTSORT.new_graph loners: no ), elements
  graph_1   = LTSORT.new_graph graph_0
  #.........................................................................................................
  T.eq graph_0[ 'loners' ], graph_1[ 'loners' ]
  T.ok graph_0 isnt graph_1
  T.ok LTSORT.has_nodes graph_0
  T.ok LTSORT.has_nodes graph_1
  for [ name_0, precedents_0, ] in Array.from graph_0[ 'precedents' ].entries()
    precedents_1 = graph_1[ 'precedents' ].get name_0
    T.ok precedents_0 isnt precedents_1
    T.eq precedents_0, precedents_1
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "copy (2)" ] = ( T ) ->
  elements  = @_probes[ 'small' ]
  graph_0   = LTSORT.populate ( LTSORT.new_graph loners: yes ), elements
  graph_1   = LTSORT.new_graph graph_0
  #.........................................................................................................
  T.eq graph_0[ 'loners' ], graph_1[ 'loners' ]
  T.ok graph_0 isnt graph_1
  T.ok LTSORT.has_nodes graph_0
  T.ok LTSORT.has_nodes graph_1
  for [ name_0, precedents_0, ] in Array.from graph_0[ 'precedents' ].entries()
    precedents_1 = graph_1[ 'precedents' ].get name_0
    T.ok precedents_0 isnt precedents_1
    T.eq precedents_0, precedents_1
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "group (1)" ] = ( T ) ->
  elements  = @_probes[ 'small' ]
  graph     = LTSORT.populate ( LTSORT.new_graph loners: no ), elements
  #.........................................................................................................
  T.eq ( LTSORT.group graph ), [ [ 'A', 'B', 'F' ], [ 'X' ], [ 'Y', 'Z' ] ]
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "group (2)" ] = ( T ) ->
  elements  = @_probes[ 'small' ]
  graph     = LTSORT.populate ( LTSORT.new_graph loners: yes ), elements
  #.........................................................................................................
  T.eq ( LTSORT.group graph ), [ [ 'F' ], [ 'A', 'B' ], [ 'X' ], [ 'Y', 'Z' ] ]
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "group (3)" ] = ( T ) ->
  elements  = @_probes[ 'small' ]
  graph     = LTSORT.populate ( LTSORT.new_graph loners: no ), elements
  #.........................................................................................................
  LTSORT.delete graph, 'F'
  T.eq ( LTSORT.group graph ), [ [ 'A', 'B', ], [ 'X' ], [ 'Y', 'Z' ] ]
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "group (4)" ] = ( T ) ->
  elements  = @_probes[ 'small' ]
  graph     = LTSORT.populate ( LTSORT.new_graph loners: yes ), elements
  LTSORT.delete graph, 'F'
  #.........................................................................................................
  T.eq ( LTSORT.group graph ), [ [], [ 'A', 'B' ], [ 'X' ], [ 'Y', 'Z' ] ]
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "test for lone node" ] = ( T ) ->
  elements  = @_probes[ 'small' ]
  graph     = LTSORT.populate ( LTSORT.new_graph loners: yes ), elements
  #.........................................................................................................
  T.eq ( LTSORT.is_lone_node graph, 'F' ), true
  T.eq ( LTSORT.is_lone_node graph, 'A' ), false
  T.throws "unknown node 'XXX'", ( => LTSORT.is_lone_node graph, 'XXX' )
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "example ()" ] = ( T ) ->
  graph     = LTSORT.new_graph()
  elements  = [
    [ 'A', 'X', ]
    [ 'B', 'X', ]
    'F'
    [ 'X', 'Y', ]
    [ 'X', 'Z', ]
    [ 'γ', 'B', ]
    [ 'Z', 'Ψ', ]
    [ 'Ψ', 'Ω', ]
    [ 'Z', 'Ω', ]
    [ 'β', 'A', ]
    [ 'α', 'β', ]
    ]
  LTSORT.populate graph, elements
  tasks = LTSORT.linearize graph
  debug '0809', tasks
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@_demo = ( S ) ->
  elements  = @_probes[ 'small' ]
  graph     = LTSORT.populate ( LTSORT.new_graph loners: no ), elements
  #.........................................................................................................
  for element in LTSORT.linearize graph
    help element
  #.........................................................................................................
  debug graph
  # help LTSORT.find_root_nodes graph, no
  if LTSORT.has_nodes graph
    if ( lone_nodes = LTSORT.find_lone_nodes graph ).length > 0
      info CND.rainbow lone_nodes
      LTSORT.delete graph, lone_node for lone_node in lone_nodes
  while LTSORT.has_nodes graph
    root_nodes = LTSORT.find_root_nodes graph
    info CND.rainbow root_nodes
    LTSORT.delete graph, root_node for root_node in root_nodes
  # debug graph
  # CND.dir LTSORT
  return null


#===========================================================================================================
# MAIN
#-----------------------------------------------------------------------------------------------------------
@_main = ( handler ) ->
  test @, 'timeout': 2500

#-----------------------------------------------------------------------------------------------------------
@_prune = ->
  for name, value of @
    continue if name.startsWith '_'
    delete @[ name ] unless name in include
  return null

############################################################################################################
unless module.parent?
  # include = []
  # @_prune()
  # @_demo()
  CND.dir LTSORT
  @_main()