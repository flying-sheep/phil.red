---
title: Python Style
---

Python Style
============
Python 3.3+
-----------
When writing new libraries and tools, ignore Python 2.
Consider a port only if someone creates a feature request or otherwise asks you for i, but require good reasons.

This way, you won’t have to deal with `Unicode(En|De)codeError`s, and are able to use all the new features.
Also modules have to avoid circular dependencies per default by forcing you to use `from .submodule import name`.

You can and should avoid encoding directive at the top.
`# -*- coding: utf-8 -*-` is the default and should never ever be deviated from.

Idiomaticity
------------
* Propertites
* Generators
* Context managers
* `itertools`
* `functools`

Expression handling
-------------------
Define your own if no standard one is suited, and only catch the most specific ones. Avoid Pokémon expression handling.

Tabs, not spaces
----------------
One tab per indentation level, no other literal tabs anywhere else in the file (use `\t` for tabs in strings).
This gives tabs an unambiguous, semantic meaning.

Other resons for the choice can be looked up [here](http://lea.verou.me/2012/01/why-tabs-are-clearly-superior/).

Naming
------
Use expressive, but not AbstractProxyBeanImpl-style names for everything.
Avoid names like used in this document (`Test`, etc.).

Use `CAPS_WITH_UNDERSCORES` for constants, `lower_with_underscores` for functions, methods, properties, and fields,
and `CamelCase` for classes. `loweCamelCase` is only for overriding methods and protocol-defined fields, nothing else.

Alignment
---------
Don’t align in leading whitespace regions such as `dict` and `list` literals, long function calls, and function declarations.

Small one liner literals are fine. For multiline ones, use a comma even in the last line. Do:

```python
short_dict = { 'foo': 'bar', 'fooz': 'baz' }

long_dict = {
	'a': 'd',
	'c': 'f',
	'e': 'b',
}

def test(
		arg1='',
		arg2=None,
		arg2=print):
	pass
```

Don’t:

```python
short_dict = {'foo': 'bar', 'fooz': 'baz',}

long_dict = {'a': 'd',
             'c': 'f',
             'e': 'b'}

def test(arg1='',
	     arg2=None,
	     arg2=print):
	pass
```

Aligning in assignments
-----------------------
When defining multiple variables and dict keys with similarly long names, feel free to align them:

```python
foo_fn  = 'foo.txt'
fooz_fn = 'fooz.txt'

ali_dict = {
	'barz': 1,
	'bar':  2,
}
```

Blank lines for grouping
------------------------
Do what you want regarding grouping of methods/classes/functions, but don’t use more than two kinds of space between item groups.

E.g. You can omit blank lines for brevity in a class with only oneliner methods, while other classes have one blank line between methods and two between groups of similar methods,
but don’t use create supergroups from method/function groups. Use namespaces or submodules for that.

Don’t put blank lines between nested block creations, such as:

```python
class Test:  # no newline now
	def __init__(self):
		pass

def read_stuff():
	with open('stuff') as f:
		return f.read()
```

Indent blank lines
------------------
Indent empty lines to the same level as surrounding lines.
That way you have visually uniform blocks when making whitespace visible.

Also you don’t have to rely on your editor to remove “trailing whitespace” when editing/saving.
E.g. the workflow of adding a new line of code between the following lines:

```python
def foo():
	line1
	
	line2
```

With unindented empty lines:

:	1. Put cursor at the end of `line1`
	2. Press return to create an indented blank line that shouldn’t be indented
	3. Press return
	3. Input code
	4. Rely on your editor to remove the whitespace in the blank line

With indented empty lines:

:	1. Put the cursor between `line1` and `line2`
	2. Press return
	3. input code
	4. press return

The latter has less editor magic and more control, and, as said, is more consistent with your block structure.

No limit on line length
-----------------------
If a line gets longer than ~120 chars, though, the code could be overly complex.
So consider breaking it up for clarity, e.g. by extracting a variable or putting the parts of a long boolean expression on separate lines.

Comparisons
-----------
Compare `None` using `is`:

```python
if param is None:
	param = []
```

Never compare booleans using `==` or `!=`.
Use boolean logic like `and`, `or`, `not`, `any` and `all` instead, and use the truthiness of everything; e.g. use `if my_list` instead of comparing its length to 0.
