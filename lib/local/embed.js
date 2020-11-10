// -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; -*-
// vim:set ft=javascript ts=2 sw=2 sts=2 cindent:

var Embed = (function($, window, undefined) {

    var normalizeSpace = function(s) {
	s = s.replace(/^\s+/, '');
	s = s.replace(/\s+$/, '');
	s = s.replace(/\s\s+/g, ' ');
	return s;
    };

    var compactJSON = function(s) {
        // remove (some) space from JSON string, giving a visually
        // more compact (but equivalent and still pretty-printed)
        // version.

        if (s === undefined) {
            return s;
        }

	// replace any space with ' ' in non-nested curly brackets
	s = s.replace(/(\{[^\{\}\[\]]*\})/g, 
		      function(a, b) { return b.replace(/\s+/g, ' '); });
	// replace any space with ' ' in [] up to nesting depth 1
// 	s = s.replace(/(\[(?:[^\[\]\{\}]|\[[^\[\]\{\}]*\])*\])/g, 
// 		      function(a, b) { return b.replace(/\s+/g, ' '); });
	// actually, up to nesting depth 2
	s = s.replace(/(\[(?:[^\[\]\{\}]|\[(?:[^\[\]\{\}]|\[[^\[\]\{\}]*\])*\])*\])/g, 
		      function(a, b) { return b.replace(/\s+/g, ' '); });
	return s
    };

    var objectToString = function(data) {
	return compactJSON(JSON.stringify(data, undefined, '    '));
    };

    var parseToken = function(token) {
	// return [text, POS] for token encoded as "text/POS", or
	// [text, "token"] if no POS (/-separated string) is included.
	var text, POS;

	m = token.match(/((?:[^\\]|\\.)+)\/(.+)$/);
	if (!m) {
	    text = token, POS = 'token';
	} else {
	    text = m[1], POS = m[2];
	}

	// apply defined backslash escape sequences
	text = text.replace(/((?:[^\\]+|\\.)*?)\\n/g, '$1\n');

	// unescape backslash escapes in text and tag
	text = text.replace(/([^\\]*)\\(.)/g, '$1$2');
	POS = POS.replace(/([^\\]*)\\(.)/g, '$1$2');

	return [text, POS];
    };

    // helper for *parse functions
    var makeLogger = function(logElement) {
        return function(s) {
	    if (logElement === undefined) {
		console.log(s);
	    } else {
		logElement.val(logElement.val() + s + '\n');
	    }
	};
    };

    // parse .ann format textbound line (helper for parseAnn)
    var parseAnnTextbound = function(line, log) {
        // NOTE: space matched more liberally than in primary format
        m = line.match(/^(\S+)\s+(\S+)\s+(\d+\s+\d+(?:;\d+\s+\d+)*)\s+(.*)$/);

        if (!m) {
            log('failed to parse textbound: "'+line+'"');
            return null;
        }

        var id = m[1],
            type = m[2],
            spanstr = m[3],
            text = m[4];

        // multiple (start, end) spans separated by semicolons
        var spanarr = normalizeSpace(spanstr).split(';'),
            spans = [];
        for (var i=0; i<spanarr.length; i++) {
            m = spanarr[i].match(/^(\d+)\s+(\d+)$/);
            if (!m) {
                log('error parsing offsets: "'+line+'"');
                return null;
            }
            var start = m[1], end = m[2];
            start = parseInt(start, 10);
            end = parseInt(end, 10);
            if (isNaN(start) || isNaN(end) || end < start) {
                log('failed to parse offsets: "'+line+'"');
                return null;
            }
            spans.push([start, end]);
        }

        // TODO verify text

        return [id, type, spans];
    };

    // parse .ann format relation line (helper for parseAnn)
    var parseAnnRelation = function(line, log) {
        // NOTE: space matched more liberally than in primary format
        m = line.match(/^(\S+)\s+(\S+)\s+(\S+):(\S+)\s+(\S+):(\S+)\s*$/);

        if (!m) {
            log('failed to parse relation: "'+line+'"');
            return null;
        }

        var id = m[1],
            type = m[2],
            a1l = m[3],
            a1i = m[4],
            a2l = m[5],
            a2i = m[6];

        return [id, type, [ [a1l, a1i], [a2l, a2i] ] ];
    };

    // parse .ann format equiv line (helper for parseAnn)
    var parseAnnEquiv = function(line, log) {
        // NOTE: space matched more liberally than in primary format
        m = line.match(/^(\S+)\s+(\S+)\s+(.+?)\s*$/);

        if (!m) {
            log('failed to parse equiv: "'+line+'"');
            return null;
        }

        var id = m[1],
            type = m[2],
            argstr = m[3];
    
        var args = normalizeSpace(argstr).split(' ');

        return [id, type].concat(args);
    };

    // parse .ann format event line (helper for parseAnn)
    var parseAnnEvent = function(line, log) {
        // NOTE: space matched more liberally than in primary format
        m = line.match(/^(\S+)\s+(\S+):(\S+)(.*)$/);

        if (!m) {
            log('failed to parse event: "'+line+'"');
            return null;
        }

        var id = m[1],
            type = m[2],
            trigger = m[3],
            argstr = m[4];

        var args = [];
        if (!argstr.match(/^\s*$/)) {
            var argarr = normalizeSpace(argstr).split(' ');
            for (var i=0; i<argarr.length; i++) {
                m = argarr[i].match(/^(\S+):(\S+)$/);
                if (!m) {
                    log('failed to parse event args: "'+line+'"');
                    return null;
                }
                args.push([m[1], m[2]]);
            }
        }

        return [id, trigger, args];
    };

    // parse .ann format modifier line (helper for parseAnn)
    var parseAnnModifier = function(line, log) {
        // NOTE: space matched more liberally than in primary format
        m = line.match(/^(\S+)\s+(\S+)\s+(\S+)\s*$/);

        if (!m) {
            log('failed to parse modifier: "'+line+'"');
            return null;
        }

        var id = m[1],
            type = m[2],
            target = m[3];

        return [id, type, target];
    };

    // parse .ann format attribute line (helper for parseAnn)
    var parseAnnAttribute = function(line, log) {
        // NOTE: space matched more liberally than in primary format
        m = line.match(/^(\S+)\s+(\S+)\s+(\S+)(.*)$/);

        if (!m) {
            log('failed to parse attribute: "'+line+'"');
            return null;
        }

        var id = m[1],
            type = m[2],
            target = m[3],
            value = m[4];

        // support also older ("modifier") format w/o value
        if (value.match(/^\s*$/)) {
            value = true;
        }

        return [id, type, target, value];
    };

    // parse .ann format normalization line (helper for parseAnn)
    var parseAnnNormalization = function(line, log) {
        // TODO: implement parsing for normalization annotations
        log('normalization annotation parsing not implemented: "'+line+'"');
        return null;
    };

    // parse .ann format comment line (helper for parseAnn)
    var parseAnnComment = function(line, log) {
        // TODO: implement parsing for comment annotations
        log('comment annotation parsing not implemented: "'+line+'"');
        return null;
    };

    // parse .ann format, return brat document data format
    var parseAnn = function(ann, log) {
	if (log === undefined) {
            log = makeLogger();
	}
	var lines = ann.split('\n');
        
	// first line is assumed to be the document text
	var document_text = lines[0];

        // parse lines after the first as .ann-formatted lines
        // (see e.g. http://brat.nlplab.org/standoff.html)
        var textbounds = [],
            relations = [],
            events = [],
            equivs = [],
            attributes = [],
            normalizations = [],
            comments = [],
            error = false;
        for (var i=1; i<lines.length; i++) {
            var line = lines[i];

            if (line.match(/^\s*$/)) {
                continue; // ignore empties
            }

            // annotation type determined by first character on line
            switch (line[0]) {
                case 'T': 
                    textbounds.push(parseAnnTextbound(line, log));
                    break;
                case 'R': 
                    relations.push(parseAnnRelation(line, log));
                    break;
                case 'E': 
                    events.push(parseAnnEvent(line, log));
                    break;
                case 'M': 
                    attributes.push(parseAnnModifier(line, log));
                    break;
                case 'A': 
                    attributes.push(parseAnnAttribute(line, log));
                    break;
                case 'N': 
                    normalizations.push(parseAnnNormalization(line, log));
                    break;
                case '*': 
                    equivs.push(parseAnnEquiv(line, log));
                    break;
                case '#': 
                    comments.push(parseAnnComment(line, log));
                    break;
                default:
                    log('failed to parse line: "'+line+'"');
                    error = true;
            }
        }

        // filter annotation lists for nulls or empties (marking parse failure),
        // setting error if found.
        var validAnnotation = function(ann) {
            if (ann !== null && ann.length != 0) {
                return true;
            } else {
                error = true; // NOTE: side-effect
                return false;
            }
        };
        textbounds = textbounds.filter(validAnnotation);
        relations = relations.filter(validAnnotation);
        events = events.filter(validAnnotation);
        equivs = equivs.filter(validAnnotation);
        attributes = attributes.filter(validAnnotation);
        normalizations = normalizations.filter(validAnnotation);
        comments = comments.filter(validAnnotation);

        log('.ann parse done, error = '+error);

        // split textbounds into entities and triggers, where any textbound
        // referenced from an event is a trigger, and everything else is an
        // entity.
        var entities = [], 
            triggers = [],
            isTrigger = {};
        for (var i=0; i<events.length; i++) {
            var triggerId = events[i][1];
            isTrigger[triggerId] = true;
        }
        for (var i=0; i<textbounds.length; i++) {
            var textboundId = textbounds[i][0];
            if (isTrigger[textboundId]) {
                 triggers.push(textbounds[i]);
            } else {
                 entities.push(textbounds[i]);
            }
        }

        return {
            'text': document_text,
            'entities': entities,
            'triggers': triggers,
            'relations': relations,
            'events': events,
            'equivs': equivs,
            'attributes': attributes,
            'normalizations': normalizations,
            'comments': comments,
            'error': error
        };
    };

    // parse SD format, return brat document data format
    var parseSd = function(sd, log) {
	if (log === undefined) {
            log = makeLogger();
	}
	var lines = sd.split('\n');

	// first line is assumed to be sentence text
	var sentence_text = lines[0];
	sentence_text = normalizeSpace(sentence_text);

	// determine token offsets and construct spans ("entities")
	var tokens = sentence_text.split(' '),
            spans = [],
            offset = 0,
            error = false;
	sentence_text = '';
	for (var i=0; i<tokens.length; i++) {
	    var text_POS = parseToken(tokens[i]);
	    var text = text_POS[0], POS = text_POS[1];
	    var length = text.length;
	    if (!text.match(/^\s*$/)) { // skip space-only (e.g. newline)
		spans.push(['T'+(i+1), POS, [[offset, offset+length]]]);
		tokens[i] = text;
	    }
	    offset += length + 1;
	    sentence_text += text + ' ';
	}

	var tokenIndex = function(t) {
	    // accept two formats: indexed ('dog-1') and simple ('dog')
	    // TODO: consider case-insensitive implementation

	    // indexed match
	    var m = t.match(/^\s*(.*)-(\d+)\s*$/)	      
	    if (m) {
		var text = m[1], idx = m[2];
		// confirm match (SD indices are 1-based)
		idx = parseInt(idx, 10) - 1;
		if (tokens[idx] === text) {
		    return idx;
		} else {
		    // TODO consider skipping output, not necessarily an error
		    log('token text mismatch: "'+text+'" vs. "'+tokens[idx]+'"');
		}
		// fall through to allow simple match for e.g. 'il-2'
	    }

	    // simple match
	    var firstIdx = $.inArray(t, tokens);
	    if (firstIdx === -1) {
		return null;
	    } else {
		if ($.inArray(t, tokens, firstIdx+1) !== -1) {
		    log('warning: multiple occurrences of "'+t+'"');
		}
		return firstIdx;
	    }
	};

	// parse lines after the first as dependencies, construct relations
	var relations = [];
	for (var i=1; i<lines.length; i++) {
	    var line = lines[i];
	    line = normalizeSpace(line);
	    
	    if (line.match(/^\s*$/)) {
		continue; // ignore empties
	    }
	    
	    var m = line.match(/^(\S+)\s*\(\s*(\S+)\s*,\s*(\S+)\s*\)$/);
	    if (!m) {
		log('failed to parse: "'+line+'"');
		error = true;
		continue;
	    }
	    var type = m[1], from = m[2], to = m[3];
	    
	    // determine which tokens are referred to
	    var fromIdx = tokenIndex(from), toIdx = tokenIndex(to);
	    if (fromIdx === null || toIdx === null) {
		log('failed to find token: "'+line+'"');
		error = true;
		continue;
	    }
	    
	    relations.push([ 'R'+i, type, [ [ 'arg1', 'T'+(fromIdx+1) ], 
					    [ 'arg2', 'T'+(toIdx+1)   ] ] ]);
	}

	log('SD parse done: '+spans.length+' tokens, '+relations.length+' dependencies.');
          
	return {
	    'text': sentence_text,
	    'entities' : spans,
            'relations' : relations,
	    'error' : error
	};
    };

    // represents CoNLL-U token or word
    var ConllUElement = function(fields) {
        this.id = fields[0];
        this.form = fields[1];
        this.lemma = fields[2];
        this.cpostag = fields[3];
        this.postag = fields[4];
        this.feats = fields[5];
        this.head = fields[6];
        this.deprel = fields[7];
        this.deps = fields[8];
        this.misc = fields[9];
    };

    ConllUElement.prototype.validId = function(id) {
        return !!this.id.match(/^\d+(?:\.\d+)?$/);
    };

    ConllUElement.prototype.isWord = function() {
        // word iff lemma is not an underscore
        return this.lemma !== '_';
    };

    ConllUElement.prototype.isToken = function() {
        // token iff ID is an integer
        return !!this.id.match(/^[0-9]+$/);
    };

    // return list of (HEAD, DEPREL) pairs
    ConllUElement.prototype.dependencies = function() {
        var headDeps = [];
        if (this.head != '_') {
            headDeps.push([this.head, this.deprel]);
        }
        if (this.deps != '_') {
            var split = this.deps.split('|');
            for (var i=0; i<split.length; i++) {
                m = split[i].match(/^(.+?):(.*)$/);
                if (m) {
                    headDeps.push([m[1], m[2]]);
                } else {
                    console.log('internal error: headDeps() with invalid DEPS');
                }
            }
        }
        return headDeps;
    }

    ConllUElement.prototype.issues = function() {
        var issues = [];

        if (!this.validId(this.id)) {
            issues.push('ID "'+this.id+'" is not valid (integer or decimal)');
        }

        if (this.form === undefined || this.form.length == 0) {
            issues.push('missing FORM');
        }

        // if all remaining fields contain just an underscore, then this
        // is a (locally) valid token (assumed to have internal words)
        if (this.lemma == '_' && 
            this.cpostag == '_' &&
            this.postag == '_' &&
            this.feats == '_' &&
            this.head == '_' &&
            this.deprel == '_' &&
            this.deps == '_' &&
            this.misc == '_') {
            return issues;
        }
        // if we're here, assume non-token.

        // TODO: check LEMMA, CPOSTAG, etc.

        return issues;
    };

    // parse CoNLL-U format, return brat document data format
    var parseConllU = function(conll, log) {
	if (log === undefined) {
            log = makeLogger();
	}

        // TODO: allow multiple sentences

	var lines = conll.split('\n');

        // each line has the following format
        // (from http://universaldependencies.github.io/docs/format.html)
        // 1.  ID: Token counter. A number, starting at 1 for each new 
        //         sentence; may be a decimal number for words inside tokens.
        // 2.  FORM: Word form or punctuation symbol.
        // 3.  LEMMA: Lemma or stem of word form.
        // 4.  CPOSTAG: Google universal part-of-speech tag, drawn from the 
        //         Universal POS tag set.
        // 5.  POSTAG: Language-specific part-of-speech tag; underscore if not 
        //         available.
        // 6.  FEATS: List of morphological features (attribute-value pairs); 
        //         underscore if not available.
        // 7.  HEAD: Head of the current token, which is either a value of ID
        //         or zero (0).
        // 8.  DEPREL: Universal Stanford dependency relation to the HEAD 
        //         (root iff HEAD = 0) or a defined language-particular subtype
        //          of one.
        // 9.  DEPS: List of secondary dependencies (head-deprel pairs).
        // 10. MISC: Any other annotation.

        var elements = [],            
            error = false;
        for (var i=0; i<lines.length; i++) {
            var line = lines[i];

            if (line.length != 0 && line[0] === '#') {
                // comment line, skip.
                // TODO: confirm that comment precedes sentence, as "Comment
                // ... lines inside sentences ... are disallowed." (docs)
                continue;
            }

            line = line.replace(/\s$/, '');
            var fields = line.split(/\s+/);
            if (fields.length !== 10) {
                // TODO: better error handling
                log('expected 10 fields, got '+fields.length+': "'+line+'"');
		error = true;
		continue;
            }

            var element = new ConllUElement(fields);

            var issues = element.issues();
            for (var j=0; j<issues.length; j++) {
                log('parse error: '+issues[j]+' (line '+(i+1)+': "'+line+'")');
            }
            if (issues.length != 0) {
                error = true;
                continue;
            }

            elements.push(element);
        }

        // prepare by-id map, checking for duplicate IDs
        var elementById = {},
            filtered = [];
        for (var i=0; i<elements.length; i++) {
            var element = elements[i];
            if (elementById[element.id] === undefined) {
                elementById[element.id] = element;
                filtered.push(element);
            } else {
                log('error: non-unique ID "'+element.id+'"');
                error = true;
            }
        }
        elements = filtered;

        // TODO: check (and resolve?) ID references:
        // - HEAD corresponds to valid non-token
        // - all heads in DEPS correspond to valid non-tokens

        var dependencies = [];
        for (var i=0; i<elements.length; i++) {
            var element = elements[i];
            var headDeps = element.dependencies();
            for (var j=0; j<headDeps.length; j++) {
                dependencies.push([element.id, headDeps[j][0], headDeps[j][1]]);
            }
        }

        var words = elements.filter(function(e) { return e.isWord() });
        var tokens = elements.filter(function(e) { return e.isToken() });
        var wordText = words.map(function(w) { return w.form }).join(' ');
        var tokenText = tokens.map(function(w) { return w.form }).join(' ');
        var combinedText = wordText;
        if (wordText != tokenText) {
            combinedText += '\n' + tokenText;
        }

        var spans = [],
            offset = 0;
        for (var i=0; i<words.length; i++) {
            var length = words[i].form.length;
	    spans.push(['T'+words[i].id, words[i].cpostag, 
                           [[offset, offset+length]]]);
            offset += length + 1;
        }

        var relations = [];
        for (var i=0; i<dependencies.length; i++) {
            var dep = dependencies[i];
            relations.push(['R'+i, dep[2], 
                            [ [ 'arg1', 'T'+dep[1] ],
                              [ 'arg2', 'T'+dep[0] ] ] ]);
        }

        // TODO: provide visualization for LEMMA, POSTAG, FEATS and MISC.

	return {
	    'text': combinedText,
	    'entities': spans,
            'relations': relations,
	    'error' : error
	};
    }

    // parse CoNLL-X format, return brat document data format
    var parseConllX = function(conll, log) {
	if (log === undefined) {
            log = makeLogger();
	}
	var lines = conll.split('\n');

        // each line has the following format
        // (from https://code.google.com/p/clearparser/wiki/DataFormat):
        //
        //     ID: token counter, starting at 1 for each new sentence
        //     FORM: word form or punctuation symbol
        //     LEMMA: lemma or stem of word form
        //     POSTAG: fine-grained part-of-speech tag
        //     FEATS: extra features ('_' indicates no extra feature)
        //     HEAD: head ID of the current token
        //     DEPREL: dependency relation to the HEAD
        // 
        // (here, we will use ID, FORM, POSTAG, HEAD and DEPREL)
        var ids = [],
            forms = [],
            postags = [],
            heads = [],
            deprels = [],
            error = false;
        for (var i=0; i<lines.length; i++) {
            var line = lines[i];
            line = line.replace(/\s$/, '');
            var fields = line.split(/\s+/);
            //var fields = line.split(/\t/);
            if (fields.length === 8) {
                ids.push(fields[0]);
                forms.push(fields[1]);
                postags.push(fields[4]);
                heads.push(fields[6]);
                deprels.push(fields[7]);
            } else {
                // TODO: better error handling
                log('expected 8 fields, got '+fields.length+': "'+line+'"');
		error = true;
		continue;
            }
        }

	var spans = [],
            relations = [],
            offset = 0;
	for (i=0; i<ids.length; i++) {
	    var length = forms[i].length;
	    spans.push(['T'+ids[i], postags[i], [[offset, offset+length]]]);
            offset += length + 1;
	    // TODO: handle root
	    if (heads[0] === 0) {
                continue;
	    }
            relations.push(['R'+ids[i], deprels[i], 
			    [ [ 'arg1', 'T'+heads[i] ],
			      [ 'arg2', 'T'+ids[i] ] ] ]);
        }

        var text = forms.join(' ');

	return {
	    'text': text,
	    'entities' : spans,
            'relations' : relations,
	    'error' : error
	};
    };

    // from http://stackoverflow.com/a/2117523
    var random_guid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    // add prefix and suffix to all IDs in data, modifying data. If neither a prefix
    // nor suffix is provided, add a random GUID prefix.
    var reviseIds = function(data, prefix, suffix) {
        if (prefix === undefined) {
            prefix = '';
        }
        if (suffix === undefined) {
            suffix = '';
        }
        if (prefix === '' && suffix == '') {
            // no prefix or suffix defined: generate random GUID prefix
            prefix = random_guid() + '-';
        }

        // entities: entity ID only
	var entities = data['entities'] || [];
	for (var i=0; i<entities.length; i++) {
            entities[i][0] = prefix + entities[i][0] + suffix;
        }

        // triggers: trigger ID only
	var triggers = data['triggers'] || [];
	for (var i=0; i<triggers.length; i++) {
            triggers[i][0] = prefix + triggers[i][0] + suffix;
        }

        // relations: relation ID and argument IDs
        var relations = data['relations'] || [];
        for (var i=0; i<relations.length; i++) {
            relations[i][0] = prefix + relations[i][0] + suffix;
            var args = relations[i][2];
            for (var j=0; j<args.length; j++) {
                args[j][1] = prefix + args[j][1] + suffix;
            }
        }

        // events: event ID, trigger ID, and argument IDs
        var events = data['events'] || [];
        for (var i=0; i<events.length; i++) {
            events[i][0] = prefix + events[i][0] + suffix;
            events[i][1] = prefix + events[i][1] + suffix;
            var args = events[i][2];
            for (var j=0; j<args.length; j++) {
                args[j][1] = prefix + args[j][1] + suffix;
            }
        }

	// equivs: argument IDs only
        var equivs = data['equivs'] || [];
        for (var i=0; i<equivs.length; i++) {
            for (var j=2; j<equivs[i].length; j++) {
                equivs[i][j] = prefix + equivs[i][j] + suffix;
            }
        }

	// attributes: attribute ID and target ID
        var attributes = data['attributes'] || [];
        for (var i=0; i<attributes.length; i++) {
            attributes[i][0] = prefix + attributes[i][0] + suffix;
            attributes[i][2] = prefix + attributes[i][2] + suffix;
        }

        // normalizations: normalization ID and target ID
        var normalizations = data['normalizations'] || [];
        for (var i=0; i<normalizations.length; i++) {
            normalizations[i][0] = prefix + normalizations[i][0] + suffix;
            normalizations[i][2] = prefix + normalizations[i][2] + suffix;
        }

        // comments: target ID only(!)
        var comments = data['comments'] || [];
        for (var i=0; i<comments.length; i++) {
            comments[i][0] = prefix + comments[i][0] + suffix;
        }

        return data;
    };

    var embeddedIdSeq = 1;

    var embedAnnotation = function(elem, parse, data, options) {
        // special case for supporting simple "~~~ sdparse [...] ~~~" 
        // syntax: if elem has a <pre> parent, add "embedding" class
        // to the <pre> so we can avoid margins etc. on the <pre>.
        elem.parent('pre').addClass('embedding');	

        // add a class to the element itself.
        elem.addClass('embedded-wrapper');

	// store sequence number for reference resolution
	elem.attr('embeddedSequenceNum', embeddedIdSeq);

	var eId = 'embedded-' + embeddedIdSeq++,
            inputTabId = eId + '-2',
            bratTabId = eId + '-3',
            infoTabId = eId + '-4';

	// visualization and related data elements
	var visDiv = $('<div id="'+eId+'-vis"></div>');
	var tabDiv = $('<div id="'+eId+'-tabs"></div>');
	var shDiv  = $('<div id="'+eId+'-sh" class="show-hide-div"></div>');
	var showHideButton = $('<button id="'+eId+'-toggle" '+
			       'class="show-hide-toggle">hide</button>');
	shDiv.append(showHideButton);

	var inputArea = $('<textarea id="'+eId+'-in" ' +
			  'class="embedded-brat-data"></textarea>');
	var bratArea = $('<textarea id="'+eId+'-brat" disabled="disabled" ' +
			 'class="embedded-brat-data"></textarea>');
	var logArea = $('<textarea id="'+eId+'-log" disabled="disabled" ' +
			'class="embedded-brat-data"></textarea>');

	// initialize parse function, falling back to SD as default
        // TODO: reconsider default
	if (parse === undefined) {
	    parse = parseSd;
	}

	// initialize data, defaulting to original element text
	if (data === undefined) {
	    data = elem.text();
	}
	data = normalizeSpace(data);    // TODO isn't this harmful for .ann?
	var parsed = parse(data, makeLogger(logArea));
        parsed = reviseIds(parsed, eId + '-');
	inputArea.text(data);
	bratArea.text(objectToString(parsed));

        // initialize options, falling back to attributes as defaults
        if (options === undefined) {
            options = {};
        }
        $.each(elem[0].attributes, function(idx) {
            var name = this.name;
            var value = this.value;
            // ignore standard attributes and options provided by caller
            var standardAttr = ['id', 'class', 'embeddedsequencenum'];
            if ($.inArray(name.toLowerCase(), standardAttr) === -1 &&
                options[name] === undefined) {
                options[name] = value;
            }
	});
				      
	// build top-level structure
	elem.empty();
	// tab headers (li+a)
	tabDiv.append([
		       '<div id="'+eId+'">',
		       '  <ul>',
		       '    <li><a href="#'+inputTabId+'">input</a></li>',
		       '    <li><a href="#'+bratTabId+'">brat</a></li>',
		       '    <li><a href="#'+infoTabId+'">info</a></li>',
		       '  </ul>',
		       '</div>'
		       ].join('\n'));
	// tab content (divs)
	var inputTab   = $('<div id="'+inputTabId+'"></div>'),
            bratTab = $('<div id="'+bratTabId+'"></div>'),
            logTab  = $('<div id="'+infoTabId+'"></div>');
	inputTab.append(inputArea);
	bratTab.append(bratArea);
	logTab.append(logArea);

	// add content to top-level element, turn into jQuery-ui tabs
	tabDiv.append(inputTab, bratTab, logTab);
	elem.append(shDiv, tabDiv, visDiv);
	tabDiv.tabs();
	var shVisible = 0;
	var setShToggleText = function() {
	    $('span', showHideButton).text(shVisible ? 'hide' : 'edit');
	}
	tabDiv.hide(); // TODO make optional (control e.g. using class)
        showHideButton.button().click(function(ev) {
	   tabDiv.toggle('blind');
	   shVisible = !shVisible;
	   setShToggleText();
	});
	setShToggleText();

        // only show tabs / tab visibility control if set in options
        if (options && !options.tabs) {
            showHideButton.hide();
            tabDiv.hide();
        }

	// initialize brat visualization
        var dispatcher = Util.embed(eId+'-vis',
          $.extend({'collection': null}, collData),
          $.extend({}, parsed), webFontURLs);

	// hook everything up
        var renderError = function() {
            bratArea.css({'border': '2px solid red'});
        };
        dispatcher.on('renderError: Fatal', renderError);

        var inputHandler = function() {
            var parsed, parse_error = false;

	    logArea.val(''); // clear log

            try {
                parsed = parse(inputArea.val(), makeLogger(logArea));
                parsed = reviseIds(parsed, embeddedIdSeq + '-');
		parse_error = parsed.error;
            } catch (e) {
		console.log(e);
		parse_error = true;
            }

	    // console.log(parse_error);

	    if (!parse_error) {
                inputArea.css({'border': '2px inset'});
	    } else {
                inputArea.css({'border': '2px solid red'});
                return;
	    }
    
	    bratArea.text(objectToString(parsed));

            try {
                dispatcher.post('requestRenderData', [$.extend({}, parsed)]);
                bratArea.css({'border': '2px inset'});
            } catch(e) {
		console.log('requestRenderData error:', e);
		logArea.append('requestRenderData error: '+e);
                bratArea.css({'border': '2px solid red'});
            }
        };
        inputArea.bind('propertychange keyup input paste', inputHandler);
    };

    var resolveEmbeddedReference = function(elem, data) {
	var refId = elem.attr('href'),
	    refElem = $(refId);
	
	if (refElem === undefined) {
	    console.log('Failed to resolve reference to', refId, 'for', elem);
	    return;
	}

	var refSeq = refElem.attr('embeddedSequenceNum');
	if (refSeq === undefined) {
	    console.log('no embeddedSequenceNum for', refElem);
	    return;
	}

	var origText = elem.text();
	var resolvedText = origText.replace(/\#/, refSeq);
	if (origText === resolvedText) {
	    console.log('failed replace in text', origText, 'for', elem);
	    return;
	}

	elem.text(resolvedText);
    };

    // class attribute values that trigger parsing using parseSd
    var parseSdClasses = [
        '.sd-parse',
        '.language-sdparse'
    ];

    // class attribute values that trigger parsing using parseConllX
    var parseConllXClasses = [
        '.conllx-parse',
        '.language-conllx',
    ];

    // class attribute values that trigger parsing using parseConllU
    var parseConllUClasses = [
        '.conllu-parse',
        '.language-conllu',
    ];

    // class attribute values that trigger parsing using parseAnn
    var parseAnnClasses = [
        '.ann-annotation',
        '.language-ann',
    ];

    var embedBratVisualizations = function() {
        // generate embedded visualizations: call embedAnnotation
	// for elements with "sd-parse" class (or variant).
        $(parseSdClasses.join(',')).each(function(idx) {
            embedAnnotation($(this), parseSd);
	});

        // repeat for elements with "conllx-parse" class (or variant), etc.
        $(parseConllXClasses.join(',')).each(function(idx) {
            embedAnnotation($(this), parseConllX);
	});

        $(parseConllUClasses.join(',')).each(function(idx) {
            embedAnnotation($(this), parseConllU);
	});

        $(parseAnnClasses.join(',')).each(function(idx) {
            embedAnnotation($(this), parseAnn);
	});

	// resolve references (e.g. "Figure #" -> "Figure 1"): call
	// resolveEmbeddedReference for elements with "embed-ref" class.
	$('.embed-ref').each(function(idx) {
            resolveEmbeddedReference($(this));
	});
    };

    return {
        embedBratVisualizations: embedBratVisualizations,
    };
})(jQuery, window);
