

# Ltsort

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Ltsort](#ltsort)
  - [Sample Usage](#sample-usage)
  - [To Do](#to-do)
  - [Is Done](#is-done)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# Ltsort


## Sample Usage


```coffee
@use_relatives = ( T, done ) ->
  { Ltsort }  = require '../../../apps/ltsort'
  g           = new Ltsort()
  #.........................................................................................................
  g.add { name: 'getup',                                    }
  g.add { name: 'brushteeth',                               }
  g.add { name: 'shop',                                     }
  g.add { name: 'cook',                   before: 'eat',    }
  g.add { name: 'serve',  after: 'cook',  before: 'eat',    }
  g.add { name: 'dishes', after: 'eat',   before: 'sleep',  }
  g.add { name: 'loner1',                                   }
  g.add { name: 'loner2',                                   }
  g.add { name: 'loner3',                                   }
  g.add { name: 'sleep',                                    }
  g.add { name: 'eat',    after: [ 'cook', 'shop', ],       }
  #.........................................................................................................
  do ->
    result      = g.linearize()
    T?.eq result, [ 'getup', 'brushteeth', 'shop', 'cook', 'serve', 'eat', 'dishes', 'sleep', 'loner1', 'loner2', 'loner3' ]
  #.........................................................................................................
  do ->
    result      = g.linearize { groups: true, }
    T?.eq result, [ [ 'getup', 'brushteeth', 'loner1', 'loner2', 'loner3' ], [ 'shop', 'cook' ], [ 'serve' ], [ 'eat' ], [ 'dishes' ], [ 'sleep' ] ]
  #.........................................................................................................
  done?()

```

```coffee
@use_global_relatives = ( T, done ) ->
  { Ltsort }  = require '../../../apps/ltsort'
  g           = new Ltsort()
  #.........................................................................................................
  g.add { name: 'getup',                      before: '*',    }
  g.add { name: 'brushteeth',                 before: '*',    }
  g.add { name: 'shop',                       before: '*',    }
  g.add { name: 'cook',                       before: 'eat',  }
  g.add { name: 'serve',      after: 'cook',  before: 'eat',  }
  g.add { name: 'dishes',     after: '*',                     }
  g.add { name: 'loner1',                                     }
  g.add { name: 'loner2',                                     }
  g.add { name: 'loner3',                                     }
  g.add { name: 'sleep',      after: '*',                     }
  g.add { name: 'eat',        after: [ 'cook', 'shop', ],     }
  #.........................................................................................................
  do ->
    result      = g.linearize()
    T?.eq result, [ 'getup', 'brushteeth', 'shop', 'cook', 'serve', 'eat', 'loner1', 'loner2', 'loner3', 'dishes', 'sleep' ]
  #.........................................................................................................
  do ->
    result      = g.linearize { groups: true, }
    T?.eq result, [ [], [ 'getup' ], [ 'brushteeth' ], [ 'shop' ], [ 'cook', 'loner1', 'loner2', 'loner3' ], [ 'serve' ], [ 'eat' ], [ 'dishes' ], [ 'sleep' ] ]
  #.........................................................................................................
  done?()
```

* use `before` and `after` to indicate ordering relationships (its 'relatives')
* both the named node and its relatives can be new or known to the graph being built (IOW one can use
  'forward references'; these nodes are implicitly created)
* single names can use a string for `before` and `after`; multiple nodes must use several calls or a list of
  node names
* nodes for which no explicit relatives are given are called 'loners'
* call `g.linearize()` to get a list of node names according to their topological sort
  * this will fail with an exception should the graph contain any cycles (as in 'a before b, b before c, c
    before a', which is impossible to satisfy)
  * generally, the sorting of the linearization will be 'stable' in the sense that the ordering of the names
    in the linearization will preserve the ordering of their introduction to the graph
* call `g.linearize { groups: true, }` like `g.linearize { groups: false, }` (the default), but returning a
  list of lists of names with the idea that all tasks identified in a sublist do not have an explicit mutual
  ordering in relation and may, therefore, be executed in parallel
  * the first (and possibly empty) sublist will always contain the 'lonely' nodes (those without an ordering
    to any other node); if these nodes denote tasks, they may be executed at any time between starting and
    completing the complex activity described by the graph. All other groups must have finished all their
    subtasks before proceding to the next group
* the linearization of an empty graph is an empty list `[]`. The grouped linearization of an empty graph is
  a list with a single empty list `[[]]`. the empty list signifies 'no loners'.
* use a star to denote when a node should come `before` or `after` all others
  * using a star applies the ordering relation—`before` or `after`—to all known nodes except the current
    one. Nodes that are added later may still come before one that was added earlier as `{ before: '*', }`
    or after one added earlier as `{ after: '*', }`
  * should there be more than one node with `{ before: '*', }`, later nodes will override earlier ones;
    therefore, adding `{ name: 't1', before: '*', }`, `{ name: 't2', before: '*', }`, `{ name: 't3', before:
    '*', }` to an empty graph will cause the first three places be occupied by `t3` on top, followed by
    `t2`, and `t1`, in that order
  * the same is true for `{ after: '*', }`
* admittedly, while the use of the attribute names `before` and `after` is colloquial and unsurprising,
  there's still room for misunderstanding; after all, when 'a comes *before* b' is true, then 'b comes
  *after* a', so which one is it in `{ name: 'a', before 'b', }`? Does it mean 'here is an a, it comes
  before b' or 'here is an a, before it there is b'? It's the former, so always think 'I come before x', 'I
  come after y'. Another way to remember this is the (I find) rather intuitive meaning of `{ name: 'a',
  before '*', }`, which means 'a comes before anything else'.

## To Do

* **[–]** modernize
* **[–]** rewrite as class
* **[–]** should we support anything but strings as keys?
* **[–]** do allow to override `before: '*'` w/out having to resort to tricks. Might want to resort to the
  principle that later statements should override earlier ones.

## Is Done

* **[+]** support symbolic `*` star to mean 'before, after any other', as implemented in
* **[+]** use more explicit `cfg` (named keys) API
