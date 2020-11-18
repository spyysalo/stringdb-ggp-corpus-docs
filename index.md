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

This section documents the guidelines for specific ambiguities in annotation.

#### Peptide hormones and neurotransmitters

[Peptide hormones](https://en.wikipedia.org/wiki/Peptide_hormone) and peptide neurotransmitters are annotated with reference to established community resources such as ChEBI (see e.g. [CHEBI:25905](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:25905), and [CHEBI:25512](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:25512)). Whether the mention of a peptide hormone or neurotransmitter name should be annotated as `GGP` or falls out of scope as a chemical is resolved as follows:

* **Gene/protein names are annotated as `GGP`**. If the active form of a peptide hormone or neurotransmitter has the same name as a gene or protein, it is annotated as `GGP`. For example, [_insulin_](https://www.uniprot.org/uniprot/P01308) and [_ghrelin_](https://www.uniprot.org/uniprot/Q9UBU3) are annotated as `GGP`. 
* In cases where the active (e.g. cleaved) form of a peptide hormone or neurotransmitter has a different name (e.g. [_angiotensin I_](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:2718) vs. [_angiotensinogen_](https://www.uniprot.org/uniprot/P01019), [_bradykinin_](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:3165) vs. [_kininogen-1_](https://www.uniprot.org/uniprot/P01042)), the name of the peptide hormone or neurotransmitter is annotated as `OOS` with comment "peptide hormone" or "neurotransmitter" (respectively).

**Examples**:

* bradykinin (`OOS`): [CHEBI:3165](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:3165), [PubChem:439201](https://pubchem.ncbi.nlm.nih.gov/compound/439201)
* angiotensin II (`OOS`): [CHEBI:48432](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:48432), [PubChem:172198](https://pubchem.ncbi.nlm.nih.gov/compound/172198)
* substance P (`OOS`): [CHEBI:80308](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:80308), [PubChem:36511](https://pubchem.ncbi.nlm.nih.gov/compound/Substance-P)

**References**:

[CHEBI:25676 - oligopeptide](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI%3A25676)
: A peptide containing a relatively small number of amino acids. [...] consists of two to twenty amino acids

---

#### Interleukins

[Interleukins](https://en.wikipedia.org/wiki/Interleukin) are a family whose members (IL-1, IL-2, etc.) include individual proteins, protein complexes, as well as subfamilies. Interleukins are annotated as follows:

* IL-1: Family (http://pfam.xfam.org/family/PF00340)
* IL-1 alpha: GGP (https://www.uniprot.org/uniprot/P01583)
* IL-1 beta: GGP (https://www.uniprot.org/uniprot/P01584)
* IL-2: GGP (https://www.uniprot.org/uniprot/P60568)
* IL-3: GGP (https://www.uniprot.org/uniprot/P08700)
* IL-4: GGP (https://www.uniprot.org/uniprot/P07750)
* IL-5: GGP (https://www.uniprot.org/uniprot/P05113)
* IL-6: GGP (https://www.uniprot.org/uniprot/P05231)
* IL-7: GGP (https://www.uniprot.org/uniprot/P13232)
* IL-8: GGP (https://www.uniprot.org/uniprot/P10145)
* IL-9: GGP (https://www.uniprot.org/uniprot/P15248)
* IL-10: GGP (https://www.uniprot.org/uniprot/P22301)
* IL-11: GGP (https://www.uniprot.org/uniprot/P20809)
* IL-12: Complex (http://amigo.geneontology.org/amigo/term/GO:0043514)
* IL-13: GGP (https://www.uniprot.org/uniprot/P35225)
* IL-14: GGP (https://www.uniprot.org/uniprot/P40222)
* IL-15: GGP (https://www.uniprot.org/uniprot/P40933)
* IL-16: GGP (https://www.uniprot.org/uniprot/Q14005)
* IL-17: unclear; JensenLab tagger marks as gene, but wiki and pfam indicate family
* IL-17A: GGP (https://www.uniprot.org/uniprot/Q16552)
* IL-18: GGP (https://www.uniprot.org/uniprot/Q14116)
* IL-19: GGP (https://www.uniprot.org/uniprot/Q9UHD0)
* IL-20: GGP (https://www.uniprot.org/uniprot/Q9NYY1)
* IL-21: GGP (https://www.uniprot.org/uniprot/Q9HBE4)
* IL-22: GGP (https://www.uniprot.org/uniprot/Q9GZX6)
* IL-23: Complex (http://amigo.geneontology.org/amigo/term/GO:0070743)
* IL-24: GGP (https://www.uniprot.org/uniprot/Q13007)
* IL-25: GGP (https://www.uniprot.org/uniprot/Q9H293)
* IL-26: GGP (https://www.uniprot.org/uniprot/Q9NPH9)
* IL-27: Complex (http://amigo.geneontology.org/amigo/term/GO:0070744)
* IL-28: Family (https://pfam.xfam.org/family/PF15177)
* IL-28A: GGP (https://www.uniprot.org/uniprot/Q8IZJ0)
* IL-28B: GGP (https://www.uniprot.org/uniprot/Q8IZI9)
* IL-29: GGP (https://www.uniprot.org/uniprot/Q8IU54)
* IL-30: GGP (https://www.uniprot.org/uniprot/Q8NEV9)
* IL-31: GGP (https://www.uniprot.org/uniprot/Q6EBC2)
* IL-32: GGP (https://www.uniprot.org/uniprot/P24001)
* IL-32 gamma: GGP (https://www.uniprot.org/uniprot/P24001-1)
* IL-33: GGP (https://www.uniprot.org/uniprot/O95760)
* IL-34: GGP (https://www.uniprot.org/uniprot/Q6ZMJ4)
* IL-35: Complex (http://amigo.geneontology.org/amigo/term/GO:0070745)

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
