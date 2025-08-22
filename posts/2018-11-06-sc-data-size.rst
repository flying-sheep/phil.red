Single cell data Size
=====================

In our_ review paper `single cells make big data`_, we showed a graph of the rising numbers of cells in datasets from the `Gene Expression Omnibus`_ (GEO). This is an updated version:

.. vega::
   
    {
        "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
        "title": "Cell numbers per year",
        "data": { "url": "/static/cellplot.json" },
        "mark": { "type": "circle", "tooltip": true },
        "encoding": {
            "x": {
                "title": "Submission date",
                "field": "x",
                "type": "temporal"
            },
            "y": {
                "title": "# Cells",
                "field": "y",
                "type": "quantitative",
                "scale": { "type": "log" }
            },
            "color": {
                "title": "Platform",
                "field": "g",
                "type": "nominal"
            },
            "hover": { "field": "t" },
            "href": { "field": "href"}
        },
        "transform": [
            { "as": "href", "calculate": "replace(datum.t, /^/, 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=')" }
        ]
    }

(last updated: 2018-11-06)

.. _our: https://www.helmholtz-muenchen.de/icb/
.. _single cells make big data: https://www.sciencedirect.com/science/article/pii/S245231001730077X
.. _Gene Expression Omnibus: https://www.ncbi.nlm.nih.gov/geo/
