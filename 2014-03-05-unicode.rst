Uniwhat‽
========

Many people don’t understand Unicode, UTF, UCS, and en- as well as decoding to and from bytes in programming languages like Python.

Since I often explained all of that, here one attempt to do it a last time.

Glyphs and 1-byte encodings
---------------------------
A way to think about strings and bytestrings is that the first is a series of glyphs (or symbols) and the latter
a series of bytes, which can hold a *representation* of the first.

.. csv-table:: The whole ASCII Table: All 1-byte encodings only had this and again as many glyphs
	:delim: tab
	:quote: ”

	␀	␁	␂	␃	␄	␅	␆	␇	␈	␉	␊	␋	␌	␍	␎	␏
	␐	␑	␒	␓	␔	␕	␖	␗	␘	␙	␚	␛	␜	␝	␞	␟
	␠	!	"	#	$	%	&	'	(	)	*	+	,	-	.	/
	0	1	2	3	4	5	6	7	8	9	:	;	<	=	>	?
	@	A	B	C	D	E	F	G	H	I	J	K	L	M	N	O
	P	Q	R	S	T	U	V	W	X	Y	Z	[	\	]	^	_
	`	a	b	c	d	e	f	g	h	i	j	k	l	m	n	o
	p	q	r	s	t	u	v	w	x	y	z	{	|	}	~	␡

In the past, there was ASCII and friends, all 1:1 mappings from one to another; one byte = one glyph. One byte is a number between 1 and :math:`2^{8bit} = 256`, or 0 and 255, or any other range you agree upon. If the agreed upon range is a range of glyphs, you have a text encoding, and translating a string of glyphs into a string of such numbers means encoding that string to a bytestring. (The reverse operation being a decoding)

[72, 105, 33]: This is a bytestring encoding “Hi!” in ASCII. (Its position in above table, beginning from 0). All encodings back then had twice as much glyphs encoded as the ones pictured above, because that’s what fits in a byte; And mostly exactly the ones above and then 128 more, because that’s compatible with ASCII and when something goes wrong, you can at least read the compatible part (i.e. the latin letters forming English sentences encoded by ASCII)

But there are more than 256 different glyphs in the world, so all of these 1-byte-encodings could only encode that small 256 glyph subset of them. There were American encodings (The latin alphabet + a number of special symbols in the remaining space), and more for other alphabets, such as latin1 for some languages including German, or Vietnamese, Cyrillic and Hebrew ones.

So we needed more bytes to encode it all.

Unicode, UTF and UCS
--------------------
Since all the encodings mapped the same code numbers to different glyphs, garbling everything once you used the wrong table to decode those numbers, the Unicode Consortium was founded, to give all glyphs, and all to come, a single, unambiguous number: Its code-point.

This is basically UCS-4 aka UTF-32 (They are the same thing for all intents and purposes): 4 bytes to represent one glyph. Unambigous, simple, and wasting space. Partly intentionally, becauseleaving room is important that glyphs can be added without changing everything, and partly because reserving 4 bytes for every glyph, while the whole text only consists of a subset is wasteful.

Because most text on the internet is English, and English fits into those 128 ASCII glyphs, wouldn’t it be useful to represent that stuff as one byte, and everything else as more? Yes, and that’s UTF-8: 1 byte for ASCII (yes, it’s exactly the same as ASCII for those glyphs and thus also follows the tradition to be ASCII-compatible), and up until 3 bytes for every other glyph.

The Part where it isn’t that easy
---------------------------------
Just use UTF-8. Then there’s no problem.

You don’t because you are a Java or Microsoft developer? A pity, because then you use UCS-2, and UCS-2 is basically the encoding hell from 30 years ago on a lesser scale. As I said: Unicode has 32-bit codepoints, but until 2003, nobody used any above 65535. Being shortsighted, some people insisted that they were strong, independent language designers who don’t need no future-proof design and used UCS-2. UCS-2 basically ignores the existence of any codepoint above 65535, and encodes the rest as two bytes (:math:`2^16 = 65536`). This way, once something “exotic” is encountered in one of those programs, weird and unpredictable errors happen, such as splitting a string in the middle of a glyph, generating garbage (when the encoding is UTF-16 in reality, not UCS-2), or unencodable glyphs.

Not pretty, and a reality that was avoidable. Just use UTF-8.
