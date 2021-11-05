Python Package Development
==========================

In this post, I evaluate Python packaging tools.
I assume familiarity with Git and Python venvs.

Package development is the process of working on a Python package.
Packages are defined by writing `package metadata`_,
which includes name, authors, … and specification of a build system.
The development cycle usually involves `feature development`_ and releases_.

Those tasks should be simple and not overburden people.
Neither with complexity nor with wildly different ways to do the same thing.

    Simple is better than complex.
    Complex is better than complicated.
    There should be one – and preferably only one – obvious way to do it.

    – :pep:`20`, The Zen of Python (excerpts)

Therefore, using the standardized way to do things should be preferred:
it is always the most widely supported way to do things (or will be eventually).
Unless there’s real pain in doing so of course, e.g. because of immature support.

I will now address the three parts of package development individually:

Package metadata
----------------

Once upon a time, the convention was to have ``setup.py``.
It contained your package metadata and a build tool as executable code.

Now there’s standards for this!

:pep:`517` – A build-system independent format for source trees
    Together with 518, this allows you to specify a build system
    in the ``[build-system]`` table in ``pyproject.toml``.
:pep:`518` – Specifying Minimum Build System Requirements for Python Projects
    This PEP goes into more details about the ``[build-system]`` table
    Notably, it specifies how 3rd party tools can be configured in ``pyproject.toml``.
    All tools except for ``flake8`` can now be configured as ``[tool.<name>]``
:pep:`621` – Storing project metadata in pyproject.toml
    This PEP defines the standard way to put project metadata into ``pyproject.toml``.
:pep:`660` – Editable installs for pyproject.toml based builds (wheel based)
    See `editable installs`_.

Each build system has a corresponding `packaging tools`.
This means with e.g. ``poetry`` as a build system,
you might want to use use ``poetry`` as CLI for `feature development`_ and releases_.

This doesn’t need to be true however.
Due to standardization, generic tools like ``pip``, ``build`` ``twine`` can be used instead.


Feature development
-------------------

The development cycle usually looks like this:

#. Update your local copy’s development branch to upstream changes
#. Update your virtual/conda environment with changed dependencies
#. Create a feature branch in source control (who am I kidding: Git.)
#. Modify code and run manual and unit tests locally
#. Offer the changes for review in a pull request
#. GOTO 4 until the change is ready for inclusion
#. Merging it into the development branch

Editable installs
~~~~~~~~~~~~~~~~~

When the development cycle involves changes to multiple projects, step 2 is a problem:
Say package ``sub`` depends on ``base``.
A new feature in ``sub`` requires a change to the public API of ``base``.
In order to speed up the design process for the ``base`` feature,
you want to work on both in concert.

Congrats, now you need to reinstall ``base`` into ``sub``’s venv,
and do that every time you change ``base``.
Editable installs are a solution.

Inspired by the ancient ``setup.py develop``,
this feature was recently standardized as :pep:`660`.


Releases
--------

To cut a release, you need to:

#. choose a version
#. tell it to your packaging tool and Git tag it
#. build package files (wheel and source distribution / ``sdist``)
#. upload package files to PyPI
#. push Git tag to the official public repository

Steps 2 and 3 depend on your build tool.
Tools like ``flit`` and ``poetry`` allow to simply say ``<tool> publish``.
Alternatively you can use ``python -m build && twine upload dist/*``.

Versioning
~~~~~~~~~~

The problem with traditional ways to handle versions is that they are manually managed.
If you update the version in ``pyproject.toml`` by hand, you *will* make mistakes.
You will then not be able to know if the version someone reports in an issue is correct.
There’s two possible solutions:

#. A release script. You need to write it, and teach using it to people.
#. Deriving your version from Git tags. Useful since you do those anyway.

Solutions for alternative 2 are plentiful.
I recommend ``setuptools_scm`` (even when not using setuptools).


Packaging tools
---------------

Setuptools
~~~~~~~~~~
The old gods: fearsome, fickle, a known evil, and clearly the past.

Setuptools_ are ``setup.py``, ``setup.cfg``, ``MANIFEST.in``, ``requirements.txt``, and … eggs?

.. _setuptools: https://setuptools.pypa.io/en/latest/

Pros:
    - Mature: If you do things right, you won’t encounter a bug. If.
    - Flexible: You can write whatever you want into your ``setup.py``.
Cons:
    - Flexible: You need to understand what happens in ``setup.py``, which can be arbitrarily custom.
      In other words, you can’t rely on everything to be made out of community-maintained building blocks.
    - Legacy mess that nobody understands:
      - Your initial setup is likely broken, doesn’t package files you want and packages files you don’t want.
      - If you ever need to change how your project is built,
        you need to bribe the wizard who initially set it all up to come out of hiding.
    - Nonstandard: Dependencies are specified in ``requirements.txt``, package metadata in ``setup.cfg``, …

Flit
~~~~
Flit_’s hummingbird is a fitting logo: small, simple, and easy to overlook.

.. _flit: https://flit.readthedocs.io/en/latest/

Pros:
    - Simple:
      - Manage your venv yourself, easily co-developing packages
        as described in `editable installs`_.
      - Use its super easy CLI to publish.
Cons:
    - Simple: Unlike poetry, it doesn’t manage dependencies for you.
    - No plugin or build step support, 

Poetry
~~~~~~
Poetry_’s like its webpage: Polished and opinionated.

.. _poetry: https://python-poetry.org/

