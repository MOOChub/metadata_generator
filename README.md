# MOOChub_JSON_tool
This is a tool to support instructors, admins, and other people interested in generating metadata according to the MOOChub format.

In the current version, arrays of EducationalAlignment objects can be created. The EducationalAlignment represents the fields of study according to the ISCED-F (https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf) or OEFOS (https://data.statistik.gv.at/web/meta.jsp?dataset=OGDEXT_KLASSDB_OEFOS2012_1) framework.

Additionally, Skill objects can be created. For Skill objects, the first three levels of ESCO (https://esco.ec.europa.eu/en/classification/skill_main) are used as a reference framework.

The tool generates JSON-type data fragments which can directly be included in the metadata schema defined by the MOOChub.
