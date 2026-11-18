How to make a website support both light and dark mode
======================================================

Answer: ``--my-color: light-dark(color, color2)`` and repeat for all colors that you want to be different between the modes.
To make that work, read on. For a rant on how not_ to do it, scroll down.

First, you need to tell the browser that your website can adapt to the preferred system or browser color scheme.
For this, put ``<meta name="color-scheme" content="light dark">`` into ``<head/>``.
This activates adaptability for the entire document, while setting the ``color-scheme: light dark`` CSS rule would activate it for a single element.
There is one benefit to the ``meta`` tag, namely that the browser won't flashbang your users with a full screen of white background shown for the split second before CSS is loaded. 

To support images, the answer depends on the kind of image; e.g. you don't actually need to do anything for photos – they look like they look, dark mode or no.
For graphics, use SVGs and the exact same approach works: set ``color-scheme: light dark`` on the SVG element and use e.g. ``stroke: light-dark(#000, #fff)``.
For monochrome symbols, you could embed a stylesheet into the SVG that only uses ``light-dark`` when the SVG is stand-alone (e.g. used as favicon or as ``<img src="...">``), but the text color when embedded into HTML:

..  code-block:: css

    svg {
        fill: currentcolor;
        &:root { fill: light-dark(black, white) }
    }

.. _not:

How not to make a website support both light and dark mode
----------------------------------------------------------

Answer: by following any of the tutorials you (at the time of writing) find when searching for how to add a dark mode toggle (`e.g. <bad1_>`__, `e.g. <bad2_>`__, `e.g. <bad3_>`_)_.
The approach all of them used creates a critical UX flaw in your website. A trap, so to speak. 

They start with the above (or, more often, an outdated and redundant variant using media queries) and add the ability to override the color scheme by forcing a color scheme on button click and remembering that override.
The trap comes from the way that none of these toggles allow you to switch back to the “follow system/browser theme” mode.
For someone who set up their system color scheme to change on dusk and dawn, this means you built a “break my website” button. 

So how to do it right? Just don't do anything.
If people want finer control, they can have their browser override the system theme, or install an extension like Dark Reader for perfect website-specific control that works everywhere.

If you for some reason really want to have that button, make sure these come early in your ``<head/>``.
This way, the color scheme is overridden as early as possible for the same “anti-flashbang” effect as above.

..  code-block:: html

    <meta name="color-scheme" content="light dark">
    <script>
    document.documentElement.style.colorScheme = localStorage.getItem("theme") ?? "normal"
    </script>

Then add a `JS function`_ to cycle through “System theme” → “Force opposite of system theme” → “Force (current) system theme” → “System theme”.
The “opposite”/“same” logic is so users see a change when they click the button for the first time and don’t assume it’s broken.

..  code-block:: javascript

    function cycleThemeOnce() {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        // Auto -> opposite of system -> same as system -> Auto
        const cycle = ["normal", prefersDark ? "light" : "dark", prefersDark ? "dark" : "light"]
        const current = document.documentElement.style.colorScheme
        const next = cycle[(cycle.indexOf(current) + 1) % cycle.length]

        document.documentElement.style.colorScheme = next
        localStorage.setItem("theme", next)
        this.dataset.theme = next
    }

It needs to be attached to a tri-state button with 3 (or 4) icons, which could be achieved like so:

..  code-block:: html

    <head>
    <!-- ... -->
    <script src="theme-cycle.js" type="module"></script>
    </head>
    <body>
    <button id="theme-cycle">
        <svg class="theme-icon-when-auto-light">...</svg>
        <svg class="theme-icon-when-auto-dark">...</svg>
        <svg class="theme-icon-when-light">...</svg>
        <svg class="theme-icon-when-dark">...</svg>
    </button>
    </body>

Sadly, the `:if()` css function is not supported well yet, so the button needs to duplicate the `color-scheme` information in its `dataset`:

..  code-block:: css
    
    #theme-cycle svg { display: none }
    @media (prefers-color-scheme: light) {
        #theme-cycle[data-theme="normal"] .theme-icon-when-auto-light { display: initial }
    }
    @media (prefers-color-scheme: dark) {
        #theme-cycle[data-theme="normal"] .theme-icon-when-auto-dark { display: initial }
    }
    #theme-cycle[data-theme="light"] .theme-icon-when-light { display: initial }
    #theme-cycle[data-theme="dark"] .theme-icon-when-dark { display: initial }

Finally, the JS function needs to be attached to the button:

..  code-block:: javascript

    function initThemeCycle() {
        const button = document.querySelector("#theme-cycle")
        button.addEventListener("click", cycleThemeOnce)
        button.dataset.theme = document.documentElement.style.colorScheme
    }
    initThemeCycle()

.. _bad1: https://ryanfeigenbaum.com/dark-mode/
.. _bad2: https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/
.. _bad3: https://kevdees.com/adding-dark-mode-toggle-to-your-website
.. _js function: https://github.com/pradyunsg/furo/blob/4026dd510f8b4462153d02c2cdc5260390740742/src/furo/assets/scripts/furo.js#L84-L107
