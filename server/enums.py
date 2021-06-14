from enum import Enum

# set enum
class Ptcf_file(Enum):
	I_PTCF = "i_ptcf"
	NI_PTCF = "ni_ptcf"

# set enum
class ComparisonType(Enum):
	INTERSECTING = "intersecting"
	NON_INTERSECTING = "non_intersecting"
