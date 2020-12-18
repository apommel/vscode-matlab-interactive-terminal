# Developed by Aurelien Pommel and other contributors

from matlab_interface import MatlabInterface
import sys

matlab = MatlabInterface()
# Run the initial script given in arg
matlab.run_script(sys.argv[1])
matlab.interactive_loop()
