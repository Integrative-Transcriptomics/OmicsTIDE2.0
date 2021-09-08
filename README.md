# Welcome to OmicsTIDE! ![build status workflow](https://github.com/Integrative-Transcriptomics/OmicsTIDE2.9/actions/workflows/main.yml/badge.svg)
The ***Omics** **T**rend-comparing **I**nteractive **D**ata **E**xplorer* (OmicsTIDE) is a web-based application to study the concordance and the discordance in the regulatory trends between omics data sets. 

OmicsTIDE combines the benefits of data- and hypothesis-driven analysis by using partitioning algorithms to detect regulatory trends between two data sets on the one hand and by allowing the user to contribute to the analysis based on prior knowledge in an interactive and exploratory manner on the other hand.

The tab-based and dynamic design of OmicsTIDE enables the user to break down large-scale data sets to a manageable and clear number of genes following three major analysis steps (see figure below) while keeping the option to review, refine or remove (previous) analysis steps.

OmicsTIDE is based on React and d3 as well as the MaterialUI framework to enable a clear and dynamic front-end design. For data loading, modification and major data modeling steps, like partitioning and the subsequent trend comparison, OmicsTIDE uses the Flask web framework as back end. 

## Installation Guide
The following steps are required to set up and run OmicsTIDE. The installation process includes python libraries for the back-end implementation. Scripts required for the front-end functions are all loaded directly from the web. 

**NOTE: Although it is recommended to work with a virtual environment to avoid package version conflicts, this step can also be skipped if the user is aware of potential conflicts.**

### 1) Basic Requirements
Python, pip and virtualenv version should be >= 3.7, >= 20.2.3 and >=20.0.23, respectively.

### 1) Setting up a Virtual Environment (venv) in Python
cd to the directory where the venv should be located and create the venv
```console
user@example:~$ cd <path/to/venv-parent-dir>
user@example:~/path/to/venv-parent-dir$ virtualenv <your-venv>
```

### 3) Required Python packages
Install required Python packages by referring to the requirements.txt-file.
```console
user@example:~$ source <your-venv>/bin/activate
(<your-venv>) user@example:~$ pip install -r <path/to/OmicsTIDE>/requirements.txt
```

## Running OmicsTIDE
Activate venv and run the python file which will open the web application in a new browser window. 
```console
user@example:~$ source <your-venv>/bin/activate
(<your-venv>) user@example:~$ npm run dev
```
OmicsTIDE requires a stable internet connection to request data from [Panther](http://www.pantherdb.org/). 
