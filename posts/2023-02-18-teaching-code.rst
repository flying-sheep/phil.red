How should we teach programming
===============================

:draft: true

I learned programming in university.
The professor insisted that the lectures didn’t form a “Java course”, but they did.
The inventors of Java made a lot of choices that resulted in limitations of what a user of the language can do.
Only they could define types whose objects can live on the stack, or overload the ``+`` operator for a class (``String``).
Attempts to rectify these won’t be able to fundamentally redesign a decades old language,
so while Java could grow these capabilities, there won’t be a reimagination of its fundamental design.

As a result, past and future university professors trying to teach programming with Java will have to give a Java course.
And people will continue to confuse justifications for Java’s (or the JVM’s) opinionated choices with invariants holding true for all of programming.
Students should see a language concept and be able to play around with it, that’s how learning works!
So what language could we use to teach instead?
I will present a few candidates who pass the “has a clean language model” test
But first a few more rules on how we can select candidates:

#. Real languages only.
   We want to give students a valuable skill and allow them to find help online when they try to use the language for non-curricular tasks.
#. A gentle-enough learning curve.
   Students should have early successes and be able to figure out why their attempts to do simple things work or not.
#. Bonus goal: The abstract machine.
   While this seemed essential back in the day,
   I think it allows for a more gradual learning experience to learn programming first,
   nd the underpinnings second.
   Also there’s the part about hardware getting more parallel,
   causing changes in CPU architecture to have rendered the C abstract machine a lie decades ago.

So for candidates, how about …

C?
    Pointers and regions of memory pointed to.
    By default built in types and user structs go on the stack, malloc/free for the heap.
    But it has a lot of rules a user has to follow:
    Don’t dereference a null pointer or a pointer to outside of the allocated region, but you have to keep track of this manually.
    Don’t double-free.
    Don’t create data races.
    And so on.
    All of these rules would be ideal to teach people about why they are there,
    but there are no diagnostics when triggering undefined behavior.
    Idiomatic C isn’t

Rust?
    Its data model is similar to C’s: References, structs, builtin types, stack by default, heap by choice.
    It also has traits and generics for type safety,
    and allows the compiler to keep track of things instead of offloading the task on users:
    RAII, lifetimes, borrow checking, and so on.
    E.g. Box<T> puts things on the heap for you and frees the memory automatically when it goes out of scope. No double-free possible.
    It’s not ideal for teaching as the learning curve is very steep, and the excellent diagnostics don’t compensate for all of it.

Python?
    Everything’s an object.
    Variables are name tags attached to them.
    There’s a few peculiarities_ to learn or to ignore (slots_), but their implact is low.
    I think some more explicit scoping (``let new_var =`` instead of ``new_var =``) would make learning more easy as well.
    It’s great for teaching, but not comprehensive, as you don’t learn memory management.

JavaScript?
    Similar to Python, even less

.. _peculiarities: https://docs.python-guide.org/writing/gotchas/
.. _slots: https://docs.python.org/3/reference/datamodel.html#slots
