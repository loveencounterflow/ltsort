

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
{ Ltsort }  = require '../../../apps/ltsort'
g           = new Ltsort()
#.........................................................................................................
g.add { name: 'getup',       before: '*', }
g.add { name: 'brushteeth',  before: '*', }
g.add { name: 'shop',        before: '*', }
g.add { name: 'cook',        before: 'eat', }
g.add { name: 'serve', after: 'cook', before: 'eat', }
g.add { name: 'dishes',      after: '*', }
g.add { name: 'sleep',       after: '*', }
g.add { name: 'eat',         after: 'cook', }
#.........................................................................................................
result      = g.linearize()
T?.eq result, [ 'getup', 'brushteeth', 'shop', 'cook', 'serve', 'eat', 'dishes', 'sleep' ]
```


## To Do

* **[–]** modernize
* **[–]** rewrite as class
* **[–]** should we support anything but strings as keys?

## Is Done

* **[+]** support symbolic `*` star to mean 'before, after any other', as implemented in
* **[+]** use more explicit `cfg` (named keys) API
