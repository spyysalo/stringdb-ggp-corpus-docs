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

### Documentation TODO

* Chromosome loci (e.g. _18q21.3_) are not annotated
* Accession numbers are annotated
* Engineered construct such as fusion proteins are not annotated; the annotation only targets products that occur naturally.

### Open issues

* GGPs which is usually working/active as homodimer, e.g. IFN-gamma: GGP? Complex? or decide context dependent?
* Families of Complexes

---

### Annotation span

For each mention of a GPP name, the annotation aims to mark **the minimal span containing the full name** of the entity mentioned in the text so that the marked span starts and ends on a boundary between an alphanumeric string and a non-alphanumeric character (e.g. space or hyphen). The following provides examples and guidelines for exceptional cases.

Modifiers and head words that are not part of the name are **excluded** from the annotated span, for example (annotated span in bold)

* _human **p53** gene_
* _wild-type **p53**_
* _phosphorylated **EGFR**_
* _**p53** mutant_

Affixes and markers such as allele designations using an asterisk are similarly **excluded** from the annotation span even when they are part of the same syntactic word with a GGP name as long as there is a separating nonalphanumeric character, for example (annotated span in bold):

* _phospho-**EGFR**_
* _anti-**CD40** antibody_
* _**CYP2C9**\*5 allele_ [\*5 is excluded]

However, annotation boundaries must coincide with the boundary between an alphanumeric and a non-alphanumeric character. In cases where a GGP name is written with one of the following regular affixes without such a boundary, the affix is **included** in the annotated span:

* species identifier, e.g. _**h**_ for _human_ or _**m**_ for _mouse_
* _**p**_ for _phosphorylated_
* _**wt**_ for _wild-type_
* _**si**_ for _small interfering RNA_
* _**sh**_ for _small/short hairpin RNA_
* _**anti**_ for _antibody_

Thus, for example (annotated span in bold):

* _the human gene **hEGP314**, and the murine gene **mEGP314**_
* _**pHDAC1** (phosphor **histone deacetylase-1**)_
* _wild-type **p53** (**wtp53**)_
* _**shLRP1** knockdown_ [GGP name LRP1]
* _**DNER** small interfering RNA (**siDNER**)_
* _**Antifactor VIII** antibody_ [GGP name factor VIII]

### Ambiguities

This section documents the guidelines for specific ambiguities in annotation.

#### Peptide hormones and neurotransmitters

[Peptide hormones](https://en.wikipedia.org/wiki/Peptide_hormone) and peptide neurotransmitters are annotated with reference to established community resources such as ChEBI (see e.g. [CHEBI:25905](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:25905), and [CHEBI:25512](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:25512)). Whether the mention of a peptide hormone or neurotransmitter name should be annotated as `GGP` or falls out of scope as a chemical is resolved as follows:

* **Gene/protein names are annotated as `GGP`**. If the active form of a peptide hormone or neurotransmitter has the same name as a gene or protein, it is annotated as `GGP`. For example, [_insulin_](https://www.uniprot.org/uniprot/P01308), [_ghrelin_](https://www.uniprot.org/uniprot/Q9UBU3) and [_somatostatin_](https://www.uniprot.org/uniprot/P61278) are annotated as `GGP`. 
* In cases where the active (e.g. cleaved) form of a peptide hormone or neurotransmitter has a different name (e.g. [_angiotensin I_](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:2718) vs. [_angiotensinogen_](https://www.uniprot.org/uniprot/P01019), [_bradykinin_](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:3165) vs. [_kininogen-1_](https://www.uniprot.org/uniprot/P01042)), the name of the peptide hormone or neurotransmitter is annotated as `OOS` with comment "peptide hormone" or "neurotransmitter" (respectively).

**Examples**:

* bradykinin (`OOS`): [CHEBI:3165](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:3165), [PubChem:439201](https://pubchem.ncbi.nlm.nih.gov/compound/439201)
* angiotensin II (`OOS`): [CHEBI:48432](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:48432), [PubChem:172198](https://pubchem.ncbi.nlm.nih.gov/compound/172198)
* substance P (`OOS`): [CHEBI:80308](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:80308), [PubChem:36511](https://pubchem.ncbi.nlm.nih.gov/compound/Substance-P)
* Orexin-A (`OOS`): [CHEBI:80319](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:80319), [PubChem:56842143](https://pubchem.ncbi.nlm.nih.gov/compound/56842143)

**References**:

[CHEBI:25676 - oligopeptide](https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI%3A25676)
: A peptide containing a relatively small number of amino acids. [...] consists of two to twenty amino acids

---

#### Enzymes

We follow the specificity cutoffs of the BioCreative II Gene Mention corpus for deciding whether an enzyme mention should be annotated or not. The following should **not** be annotated when appearing standalone:

* _kinase_, _protein kinase_
* _polymerase_
* _protease_
* _transferase_

By contrast, more specific enzyme names such as the following are annotated:

* _tyrosine kinase_, _protein tyrosine kinase_: `Family` (http://pfam.xfam.org/family/PF07714)
* _RNA polymerase_, _DNA polymerase_: `Family`
* _serine protease_, _metalloprotease_: `Family`
* _alanine aminotransferase_: `Family`

Other enzyme names such as the following are also annotated:

* _amylase_, _helicase_, _ligase_, _lyase_, _methyltransferase_, _reverse transcriptase_, _telomerase_, _GTPase_, _ATPase_

#### Cytokines

We follow the specificity cutoffs of the BioCreative II Gene Mention corpus for deciding whether an enzyme mention should be annotated or not. The following should not be annotated when appearing standalone:

* _cytokine_, _chemokine_

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
* IL-17: Family (https://pfam.xfam.org/family/IL17)
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

growth factor
: `Out of scope` (nonspecific: <https://en.wikipedia.org/wiki/Growth_factor>)

Ras
: `Family`

VEGF
: `Family` (includes [VEGF-A](https://www.uniprot.org/uniprot/P15692), [VEGF-B](https://www.uniprot.org/uniprot/P49765) and others)

MHC
: `Complex` ([GO:0042611](http://amigo.geneontology.org/amigo/term/GO:0042611)); also MHC-I/MHC class I ([GO:0042612](http://amigo.geneontology.org/amigo/term/GO:0042612)) and MHC-II/MHC class II ([GO:0042613](http://amigo.geneontology.org/amigo/term/GO:0042613))

* Histones:
  * Tag __H3__ etc. as `GGP` also when they appear standalone
  * Include __histone__ in the span when it appears with one of the names (e.g. _histone H3_)
  * Tag __histone__ as `Family` when it appears standalone.
  * discontinuous or decomposed `GGP` for mentions such as __histones H2A and H3__.

## Links

For information on Annodoc, see <http://spyysalo.github.io/annodoc/>.
