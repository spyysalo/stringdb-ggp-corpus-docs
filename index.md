---
layout: entry
title: Documentation for STRING DB GGP annotation
---

## Document selection

### Abstract sample 01

A sample of 1000 PubMed abstracts selected by comparing JensenLab tagger GGP matches to mentioned tagged by a BioBERT model trained on the BC2GM corpus and selecting a random subset filling the following criteria:

* Number of unique tagged names (ignoring case) > 1
* Annotations / 100 words >= 1
* 50% < f-score of one tagger against the other < 100%
* No title-only documents
* 50% of mentions need to be forms that have not been seen in abstracts selected so far (case-insensitive)

### General annotation guidelines

* Peptide hormones which is encoded by a GGP and processed into mature form, e.g. angiotensin: GGP? Chemical? OOS?
* GGPs which is usually working/active as homodimer, e.g. IFN-gamma: GGP? Complex? or decide context dependent?
* Families of Complexes

### Individual cases

NF-κB
: `Complex` (<http://amigo.geneontology.org/amigo/term/GO:0071159>)

G proteins
: `Family`

angiotensin II
: `Out of scope` (Chemical: <https://pubchem.ncbi.nlm.nih.gov/compound/172198>, cleavage product of [Angiotensinogen](https://www.uniprot.org/uniprot/P01019))


## Links

For information on Annodoc, see <http://spyysalo.github.io/annodoc/>.
