# Welcome to OmicsTIDE! ![build status workflow](https://github.com/Integrative-Transcriptomics/OmicsTIDE2.0/actions/workflows/main.yml/badge.svg) [![DOI](https://zenodo.org/badge/389345466.svg)](https://zenodo.org/badge/latestdoi/389345466)

The ***Omics** **T**rend-comparing **I**nteractive **D**ata **E**xplorer* (OmicsTIDE) is a web-based application to study the concordance and the discordance in the regulatory trends between omics data sets. 

OmicsTIDE combines the benefits of data- and hypothesis-driven analysis by using partitioning algorithms to detect regulatory trends between two data sets on the one hand and by allowing the user to contribute to the analysis based on prior knowledge in an interactive and exploratory manner on the other hand.

The tab-based and dynamic design of OmicsTIDE enables the user to break down large-scale data sets to a manageable and clear number of genes following three major analysis steps (see figure below) while keeping the option to review, refine or remove (previous) analysis steps.

OmicsTIDE is based on React and d3 as well as the MaterialUI framework to enable a clear and dynamic front-end design. For data loading, modification and major data modeling steps, like partitioning and the subsequent trend comparison, OmicsTIDE uses the Flask web framework as back end. 
## Usage guide

OmicsTIDE is available at http://omicstide-tuevis.cs.uni-tuebingen.de/.

### 1) Loading data
- Select two or more files or load test files. First column: Gene IDs, header "gene", Other columns conditions, e.g. timepoint 1, timepoint 2, timepoint 3. Cells: expression values. You can also apply your own clustering algorithm und upload the results. (See example data: https://github.com/Integrative-Transcriptomics/OmicsTIDE2.0/tree/master/server/data)
- Select k for k-means: K determines how many trends will be created, feel free to play with different K for your data. Alternatively, you can download the normalized date (Button "Download processed data" on the data loading tab) and use our "testk.py" script to find a suitable k. (https://github.com/Integrative-Transcriptomics/OmicsTIDE2.0/blob/master/testk.py)
- Variance filter: Filters data by percentile of variance. Sometimes results are improved by only considering highly variant genes.
- PANTHER species selection. For functional analysis you need to select the correct species from the list of available species at Panther. Your gene IDs need match those used by PANTHER. Selecting the species is optional. If you do not have fitting IDs you can still conduct an analysis but without functional analysis.
### 2) Comparison selection
In the comparison selection tab you can select a comparison of interest based on the number of intersecting/non-intersecting and concordant/discordant genes.
### 3) First level analysis
The Sankey diagrams shows the size of the clusters (nodes) and how many genes are shared between the trends of the two datasets (links). By clicking at nodes and links groups of genes can be selected for second level analysis.
#### Sidebar
- Plot types: You can choose between centroid profile plots (default), profile plots, and box plots for the visualization of trends.
- Filters: You can use the filters in the sidebar to, for example, focus on highly variant, highly expressed genes. Moreover, you can filter out small intersections. 
- Exporting: The current cluster assignments can be exported, as well as the visualization.
- Gene search: Search for specific genes or upload genes of interest as a list. These genes will be highlighted in the visualization.
### 4) Second level analysis
- Visualization: The second level analysis shows the selected genes as profile plots. Similarly to the first level analysis you can search for genes and export the visualization.
- Functional Analysis: PANTHER can be used to perform GO term enrichment for the genes in the detailed analysis. You can either choose all the genes in the current comparison (first level analysis) as the background or all the genes of the species. 
## Local Installation Guide
The following steps are required to set up and run OmicsTIDE. The installation process includes python libraries for the back-end implementation. Scripts required for the front-end functions are all loaded directly from the web.
### 1) Basic Requirements

Software | Version |
---|---
Python | 3.10 |
pip | 23.3.2 |
node | 22.1.0 |

### 2) Setting up a Virtual Environment (venv) in Python
cd to the directory where the venv should be located and create the venv
```console
user@example:~$ cd <path/to/venv-parent-dir>
user@example:~/path/to/venv-parent-dir$ python -m venv <your-venv>
```
### 3) Install required Python packages
Install required Python packages by referring to the requirements.txt-file.
```console
user@example:~$ source <your-venv>/bin/activate
(<your-venv>) user@example:~$ pip install -r <path/to/OmicsTIDE>/requirements.txt
(<your-venv>) user@example:~$ pip install . <path/to/OmicsTIDE>/
```
### 4) Install required javascript packages
cd to the project directory
```console
user@example:~$ cd <path/to/project-dir>
user@example:~/path/to/project-dir$ yarn install
```
## Running OmicsTIDE
Activate venv and run the python file which will open the web application in a new browser window. 
```console
user@example:~$ source <your-venv>/bin/activate
(<your-venv>) user@example:~$ yarn run dev
```
OmicsTIDE requires a stable internet connection to request data from [Panther](http://www.pantherdb.org/). 
