

# LTSort

*With inspiration from https://github.com/eknkc/tsort
and http://stackoverflow.com/a/5100904* 

## Rationale

## API

### Creation

#### `@new_graph settings`

Create a new graph object. `settings`, if used, may be an object containing a single named
item `loners`, which should be `true` or `false`; it is only relevant for 
`LTSORT.find_root_nodes` and `LTSORT.group`, for which see below. Alternatively, `settings`
may be a graph itself, in which case a copy of that graph will be returned.

### Population

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

### Deletion

#### `@delete graph, name`

Remove the node identified by `name` from `graph`. Currently, only nodes
that have no precedents (i.e. root nodes, including unconnected ('lone') nodes)
may be deleted. This is used by `LTSORT.group`, below.

### Retrieval

#### `@has_node graph, name`

Return whether `graph` has a node labelled with `name`.

#### `@has_nodes graph`

Return whether `graph` has any nodes at all.


#### `@is_lone_node graph, name`

Return whether the node labelled `name` is a 'lone' node (i.e. one without precedents
and without consequents; a node that is not part of any edge). Will throw an error
if `graph` doesn't have a node labelled `name`.

#### `@find_lone_nodes graph, root_nodes = null`

Return a list of all lone nodes in the graph.

#### `@find_root_nodes graph, loners = null`

Return a list of all root nodes in the graph (i.e. those nodes that have no precedents /
depend on nothing else in the graph). If `loners` is given and true, that list will
include lone nodes; if it is given and false, that list will exclude lone nodes. If
`loners` is not given, the graph's `loners` property will be used instead.

### Sorting

#### `@linearize graph`

Return a list with node labels, ordered such that all consequents come after their
precedents. In other words, in a graph where edges represent dependencies and
where a given task `y` depends on task `x` having been finished, its
linearization will spell out one way in which to perform actions such that all
prerequisites `x` come before any of their dependent tasks `y`. For example:

```coffee
graph     = LTSORT.new_graph()
elements  = [
  [ 'A', 'X', ]
  [ 'B', 'X', ]
  'F'
  [ 'X', 'Y', ]
  [ 'X', 'Z', ]
  [ 'δ', 'B', ]
  [ 'Z', 'Ψ', ]
  [ 'Ψ', 'Ω', ]
  [ 'Z', 'Ω', ]
  [ 'β', 'A', ]
  [ 'α', 'β', ]
  ]
LTSORT.populate graph, elements
tasks = LTSORT.linearize graph
```

`tasks` now equals 

```coffee
[ 'α', 'β', 'A', 'δ', 'B', 'X', 'F', 'Y', 'Z', 'Ψ', 'Ω' ]
```

(although the exact placement of some nodes such as `F` is not guaranteed). Going
through the precedence rules given, we can ascertain this result is 'sufficiently
good' to base a step-by-step procedure upon: 

* `α ⇒ β` was specified, and, indeed, `α` comes before `β` in the linearization.
* `A ⇒ X` and `B ⇒ X` were specified, and, indeed, both `A` and `B` come before `X`.
* Both `Z` and `Y` depend on `X`, and they indeed come after `X`. 
* `δ ⇒ B ⇒ X` was specified, and, indeed, `δ`, `B` and `X` appear in that order.
* &c.

#### `@group graph, loners = null`

Like `LTSORT.linearize`, but return a list of lists instead. Using the same 
setup as shown above, but using `LTSORT.group` instead of `LTSORT.linearize`:

```coffee
  tasks = LTSORT.group graph
```

we get:

```coffee
  [ [ 'F' ],
    [ 'δ', 'α' ],
    [ 'B', 'β' ],
    [ 'A' ],
    [ 'X' ],
    [ 'Y', 'Z' ],
    [ 'Ψ' ],
    [ 'Ω' ] ]
```

Each element in the list represents a number of steps that may be performed in
parallel (i.e. tasks that are independent of each other). Here we have
created the graph with an (implicit) setting `loners: true`, which causes
lone tasks to be singled out as the first (possibly empty) list; had we
created the graph with `loners: false` (or called `LTSORT.group graph,
false`), the first groupp of tasks would have become `[ 'F', 'δ', 'α' ]`.

Observe that the ordering of nodes within each group is not defined; it may or
may not change when nodes and edges are added in a different order.













