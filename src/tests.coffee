



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


############################################################################################################
### This is a mock for the `MK` global normally instantiated by `mingkwai/lib/main.js`. ###
unless global.MK?
  require '../../mingkwai'
  # CND.dir MK
  # CND.dir MK.TS
  # global.MK                 = {}
  # global.MK.TS              = require './main'


# #===========================================================================================================
# # HELPERS
# #-----------------------------------------------------------------------------------------------------------
# show_events = ( probe, events ) ->
#   whisper probe
#   echo "["
#   for event in events
#     echo "    #{JSON.stringify event}"
#   echo "    ]"

# #-----------------------------------------------------------------------------------------------------------
# copy_regex_non_global = ( re ) ->
#   flags = ( if re.ignoreCase then 'i' else '' ) + \
#           ( if re.multiline  then 'm' else '' ) +
#           ( if re.sticky     then 'y' else '' )
#   return new RegExp re.source, flags

# #-----------------------------------------------------------------------------------------------------------
# list_from_match = ( match ) ->
#   return null unless match?
#   R = Array.from match
#   R.splice 0, 1
#   return R

# #-----------------------------------------------------------------------------------------------------------
# match_first = ( patterns, probe ) ->
#   for pattern in patterns
#     return R if ( R = probe.match pattern )?
#   return null

# #-----------------------------------------------------------------------------------------------------------
# nice_text_rpr = ( text ) ->
#   ### Ad-hoc method to print out text in a readable, CoffeeScript-compatible, triple-quoted way. Line breaks
#   (`\\n`) will be shown as line breaks, so texts should not be as spaghettified as they appear with
#   JSON.stringify (the last line break of a string is, however, always shown in its symbolic form so it
#   won't get swallowed by the CoffeeScript parser). Code points below U+0020 (space) are shown as
#   `\\x00`-style escapes, taken up less space than `\u0000` escapes while keeping things explicit. All
#   double quotes will be prepended with a backslash. ###
#   R = text
#   R = R.replace /[\x00-\x09\x0b-\x19]/g, ( $0 ) ->
#     cid_hex = ( $0.codePointAt 0 ).toString 16
#     cid_hex = '0' + cid_hex if cid_hex.length is 1
#     return "\\x#{cid_hex}"
#   R = R.replace /"/g, '\\"'
#   R = R.replace /\n$/g, '\\n'
#   R = '\n"""' + R + '"""'
#   return R

#===========================================================================================================
# TESTS
#-----------------------------------------------------------------------------------------------------------
@[ "_XXX" ] = ( T, done ) ->
  done()

#-----------------------------------------------------------------------------------------------------------
@_demo = ( S ) ->
  # TS              = CND.TSORT
  TS              = @
  graph           = TS.new_graph()
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
      TS._register graph, element
    else
      [ a, b, ] = element
      TS.add graph, a, '>', b
  #.........................................................................................................
  for element in TS.sort graph
    help element
  #.........................................................................................................
  debug graph
  # help TS._find_root_nodes graph, no
  if TS.has_nodes graph
    if ( lone_nodes = TS._find_lone_nodes graph ).length > 0
      info CND.rainbow lone_nodes
      TS._delete graph, lone_node for lone_node in lone_nodes
  while TS.has_nodes graph
    root_nodes = TS._find_root_nodes graph
    info CND.rainbow root_nodes
    TS._delete graph, root_node for root_node in root_nodes
  debug graph
  CND.dir TS
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
  @_demo()

