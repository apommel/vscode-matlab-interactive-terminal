# Checks if the necessary Python dependencies are present on the system at activation
import sys

try: # Check if the Matlab Engine is installed
    import matlab.engine
except ImportError:
    exit(1)
else:
    exit(0)