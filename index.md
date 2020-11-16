---
layout: entry
title: Documentation for STRING DB GGP annotation
---

## Document selection

### Abstract sample 01

A sample of 1000 PubMed abstracts selected by comparing JensenLab tagger GGP matches to mentions tagged by a BioBERT model trained on the BC2GM corpus and selecting a random subset filling the following criteria:

* Number of unique tagged names (ignoring case) > 1
* Annotations / 100 words >= 1
* 50% < f-score of one tagger against the other < 100%
* No title-only documents
* 50% of mentions need to be forms that have not been seen in abstracts selected so far (case-insensitive)

---

### Open issues

* GGPs which is usually working/active as homodimer, e.g. IFN-gamma: GGP? Complex? or decide context dependent?
* Families of Complexes

---

### Ambiguities

This section documents the guidelines for specific ambiguities between different annotations.

#### Peptide hormones

[Peptide hormones](https://en.wikipedia.org/wiki/Peptide_hormone) are annotated with reference to established community resources such as ChEBI (see e.g. <https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:25905>). Whether the mention of a peptide hormone name should be annotated as `GGP` or falls out of scope as a chemical is resolved as follows:

* **Gene/protein names are annotated as `GGP`**. If the active form of a peptide hormone has the same name as a gene or protein, it is annotated as `GGP`. For example, [_insulin_](https://www.uniprot.org/uniprot/P01308) and [_ghrelin_](https://www.uniprot.org/uniprot/Q9UBU3) are annotated as `GGP`. 
* In cases where the active (e.g. cleaved) form of a peptide hormone has a different name (e.g. [_angiotensin I_](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:2718) vs. [_angiotensinogen_](https://www.uniprot.org/uniprot/P01019), [_bradykinin_](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:3165) vs. [_kininogen-1_](https://www.uniprot.org/uniprot/P01042)), the name of the peptide hormone is annotated as `OOS` with comment "peptide hormone".

**Examples**:

* bradykinin (`OOS`): [CHEBI:3165](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:3165), [PubChem:439201](https://pubchem.ncbi.nlm.nih.gov/compound/439201)
* angiotensin II (`OOS`): [CHEBI:48432](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:48432), [PubChem:172198](https://pubchem.ncbi.nlm.nih.gov/compound/172198)

**References**:

[CHEBI:25676 - oligopeptide](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI%3A25676)
: A peptide containing a relatively small number of amino acids. [...] consists of two to twenty amino acids

---

### Individual cases

NF-κB
: `Complex` (<http://amigo.geneontology.org/amigo/term/GO:0071159>)

G proteins
: `Family`

angiotensin II
: `Out of scope` (Chemical: <https://pubchem.ncbi.nlm.nih.gov/compound/172198>, cleavage product of [Angiotensinogen](https://www.uniprot.org/uniprot/P01019))

* Histones:
  * Tag __H3__ etc. as `GGP` also when they appear standalone
  * Include __histone__ in the span when it appears with one of the names (e.g. _histone H3_)
  * Tag __histone__ as `Family` when it appears standalone.
  * discontinuous or decomposed `GGP` for mentions such as __histones H2A and H3__.

## Links

For information on Annodoc, see <http://spyysalo.github.io/annodoc/>.
