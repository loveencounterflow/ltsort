

# LTSort

*With inspiration from https://github.com/eknkc/tsort
and http://stackoverflow.com/a/5100904* 

## Rationale

## API

## Creation

#### `@new_graph settings`

Create a new graph object. `settings`, if used, may be an object containing a single named
item `loners`, which should be `true` or `false`; it is only relevant for 
`LTSORT.find_root_nodes` and `LTSORT.group`, for which see below. Alternatively, `settings`
may be a graph itself, in which case a copy of that graph will be returned.

## Population

#### `@add graph, lhs, relation = null, rhs = null`

Add a node or an edge to the graph. Possible forms are:

* `LTSORT.add graph, 'A'`—add a node labelled `A` to the graph.

* `LTSORT.add graph, 'A', 'B'`—add an edge to the graph that states that node `A` 
  must precede node `B`. `A` and `B` will be added implicitly if not already present in the graph.

#### `@populate graph, elements`

Add all `elements` to the `graph`. `elements` should be a list of strings 
and pairs of strings; single strings will be registered as nodes and pairs
of strings will be interpreted as precedent/consequent pairs. For example:

```coffee
graph     = LTSORT.new_graph()
elements  = [
  [ 'A', 'X', ]
  [ 'B', 'X', ]
  'F'
  [ 'X', 'Y', ]
  [ 'X', 'Z', ]
  ]
LTSORT.populate graph, elements
```

## Deletion

#### `@delete graph, name`

Remove the node identified by `name` from `graph`. Currently, only nodes
that have no precedents (i.e. root nodes, including unconnected ('lone') nodes)
may be deleted. This is used by `LTSORT.group`, below.

## Retrieval

#### `@has_node graph, name`

XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX 

#### `@has_nodes graph`

XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX 

#### `@is_lone_node graph, name`

XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX 

#### `@find_lone_nodes graph, root_nodes = null`

XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX 

#### `@find_root_nodes graph, loners = null`

XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX 

## Sorting

#### `@group graph, loners = null`

XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX 

#### `@linearize graph`

XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX 














