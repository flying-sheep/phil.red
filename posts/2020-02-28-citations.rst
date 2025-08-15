Citation Systems
================

Citation systems suck. Some less than others.
What’s there? What does an ideal one look like?
But most importantly: What do we want?
In decreasing order of importance, that’s for me:

Supports my document processor
    For most academics, this means LaTeX i.e. bibTeX or bibLaTeX + Biber.
    For me this means ConTeXt_ these days, which supports bibTeX (but in UTF-8).
    It also supports Lua filters to read anything you can code up.
    I heard some people also use “Word”. It has a GUI, interesting!
Easily add new papers
    For many systems this means a browser addon where you find a page and click the button.
    But you have to leave your document processor!
    Except with Paperpile, which is really neat, as you can full-text search papers directly from Google Docs or Word.
    It’s slow however, and its database (see next point) doesn’t work with Firefox (boo!)
Correct
    All systems have their own ways of working, which are differently wrong.
    But there’s two better ways:
    https://doi.org can be used as a `citation service`_, but it’s incomplete and returns `@Misc` often.
    CiteAs_ however is pretty amazing, and offers an API front and center.
Also manages documents
    I want to quickly get from my publication DB to a readable version of the paper.
    Current solutions work by maintaining their own database where you upload *all* PDFs to.
    But why upload open access PDFs? Or for that matter why not just read the HTML version?
    My dream solution would simply use the canonical PDF URL to download and cache PDF when you want them.
    And for paywalled papers, it would have a neat little integration with SciHub_.

.. _ConTeXt: https://www.contextgarden.net/
.. _CiteAs: https://citeas.org/
.. _citation service: https://www.crossref.org/labs/citation-formatting-service/
.. _SciHub: https://de.wikipedia.org/wiki/Sci-Hub

So where does that leave us?
My perfect system would just be an document processor plugin synced to an online service.
The online service would hold (and allow you to edit) custom citations that don’t have a DOI.
It would also allow you to attach personal tags and notes to DOIs so you can find them faster.
For this you could use an online website interface or a local application.
The local application would retrieve and cache PDFs from open access URLs or SciHub_.

The editor plugin would allow searching documents and inserting citations.
For *TeX*, it would look like this:

1. On key press (e.g. autocompleting ``\cite{<tab>``), it would pop up a little search box with a list of results.
2. Confirming an entry would insert the DOI directly: ``\cite{10.3233/978-1-61499-649-1-87}``
3. Alternatively you could configure it to create a file next to the main document that holds aliases:
   ``Kluyver2016   10.3233/978-1-61499-649-1-87``

For Word, Libreoffice Writer, Google Docs, and so on, it would work exactly like Paperpile.
Only it would be free and using CiteAs_ as data backend.

For now, I’ll just witch back to Zotero, it sucks least.
