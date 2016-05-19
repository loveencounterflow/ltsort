



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
# TESTS
#-----------------------------------------------------------------------------------------------------------
@[ "sorting" ] = ( T ) ->
  graph           = LTSORT.new_graph()
  #.........................................................................................................
  elements = [
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
  for element in elements
    if CND.isa_text element
      LTSORT.add graph, element
    else
      [ a, b, ] = element
      LTSORT.add graph, a, '>', b
  #.........................................................................................................
  probe = LTSORT.linearize graph
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
  graph           = LTSORT.new_graph()
  #.........................................................................................................
  elements = [
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
  for element in elements
    if CND.isa_text element
      LTSORT.add graph, element
    else
      [ a, b, ] = element
      LTSORT.add graph, a, '>', b
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
  graph           = LTSORT.new_graph()
  #.........................................................................................................
  elements = [
    [ 'A', 'X', ]
    [ 'B', 'X', ]
    'F'
    [ 'X', 'Y', ]
    [ 'X', 'Z', ]
    ]
  #.........................................................................................................
  for element in elements
    if CND.isa_text element
      LTSORT.add graph, element
    else
      [ a, b, ] = element
      LTSORT.add graph, a, '>', b
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
  elements = [
    [ 'A', 'X', ]
    [ 'B', 'X', ]
    'F'
    [ 'X', 'Y', ]
    [ 'X', 'Z', ]
    ]
  #.........................................................................................................
  graph = LTSORT.new_graph()
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
  #.........................................................................................................
  elements = [
    [ 'A', 'X', ]
    [ 'B', 'X', ]
    'F'
    [ 'X', 'Y', ]
    [ 'X', 'Z', ]
    ]
  #.........................................................................................................
  graph = LTSORT.new_graph loners: no
  #.........................................................................................................
  for element in elements
    if CND.isa_text element
      LTSORT.add graph, element
    else
      [ a, b, ] = element
      LTSORT.add graph, a, '>', b
  #.........................................................................................................
  T.eq ( LTSORT.find_root_nodes graph ),        [ 'A', 'B', ]
  T.eq ( LTSORT.find_root_nodes graph, true ),  [ 'A', 'B', 'F' ]
  T.eq ( LTSORT.find_root_nodes graph, false ), [ 'A', 'B' ]
  T.eq ( LTSORT.find_lone_nodes graph ),        [ 'F' ]
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@_demo = ( S ) ->
  graph           = LTSORT.new_graph()
  #.........................................................................................................
  elements = [
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
  for element in elements
    if CND.isa_text element
      LTSORT._register graph, element
    else
      [ a, b, ] = element
      LTSORT.add graph, a, '>', b
  #.........................................................................................................
  for element in LTSORT.sort graph
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
  @_main()
  # @_demo()

