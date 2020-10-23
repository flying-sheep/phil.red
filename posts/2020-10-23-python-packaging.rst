Python Packaging
================

You want to create a Python package with no complicated build steps.
Many things have been written, so here is a small opinionated tutorial.
We’ll be using:

1. Flit_, not ``setup.py``, as nobody needs to know what a ``MANIFEST.in`` is.
2. `get_version`_, as not having to update git tags *and* ``__version__`` is nice.

.. _Flit: https://flit.readthedocs.io/
.. _get_version: https://pypi.org/project/get_version/

You’ll need the following setup::

    MyPackage           ← the project directory
    ├── my_package      ← the name you want to import it with
    │  ├── __init__.py  ← this will contain all the exports
    │  └── __main__.py  ← if your package has a main CLI
    ├── README.rst      ← you can also use README.md
    ├── .git/*          ← create using `git init`
    └── pyproject.toml  ← create using `flit init`

But one step at a time.

1. Start by manually creating your project directory (``MyPackage``).
2. Make it a git repository, e.g. using `git init`.
3. Create a ``README.rst`` or ``README.md`` file.
4. Create either ``my_package.py`` or ``my_package/__init__.py``:

   .. code:: python

      """The first sentence of the docstring is your description."""

      from get_version import get_version
      __version__ = get_version(__file__)
      del get_version

5. Install the Flit command line interface (CLI) and use it
   to create a ``pyproject.toml``::

       python3 -m pip install flit
       flit init

6. Add ``get_version`` to ``[build-system].requires``
   *and* ``[tool.flit.metadata].requires`` to it:

   .. code:: toml

      [build-system]
      requires = ["flit_core >=2,<4", "get_version"]  # here
      build-backend = "flit_core.buildapi"

      [tool.flit.metadata]
      ...
      requires = ["get_version"]                      # and here

7. Add additional runtime dependencies to ``[tool.flit.metadata].requires``.

   You can also add test and documentation dependencies_.

   .. _dependencies: https://github.com/theislab/scanpydoc/blob/v0.5/pyproject.toml#L26-L36


Developing
----------

Link your editable development version to your virtual environment::

    flit install --symlink

Whenever you’re happy with a version, tag it::

    git tag v1.0  # Don’t forget the “v”!
    git push --tags

If your package should go public, you can publish it to PyPI::

    flit publish


Installing the dev version
--------------------------

If your package is private or just not PyPI-ready,
you can install a non-editable version via ``flit install``,
but also without installing Flit, just using pip::

    pip install https://github.com/me/MyPackage

Or::

    cd MyPackage
    pip install .

That comes in handy e.g. in CI or if you want other people to use it.


Caveat
------

If you import 3rd party packages in your ``__init__.py``,
and those are not installed yet (e.g. on CI),
Flit will be unable to determine the version.
You can get around that with this hack:

``my_package/_metadata.py``:
    .. code:: python

       import traceback
       from get_version import get_version
       __version__ = get_version(__file__)

       def within_flit():
           for frame in traceback.extract_stack():
               if frame.name == 'get_docstring_and_version_via_import':
                   return True
           return False

``my_package/__init__.py``:
    .. code:: python

       """Your package docstring"""

       from ._metadata import __version__, within_flit

       if not within_flit():
           from .subpackage import thing
