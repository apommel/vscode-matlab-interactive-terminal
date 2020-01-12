try: # Check if the Matlab Engine is installed
    import matlab.engine
except ImportError:
    print("Matlab Engine for Python cannot be detected. Please install it for the extension to work")
    fail = True
else:
    fail = False
    # Starting the Matlab engine
    eng = matlab.engine.start_matlab()

loop=True # Looping allows for an interactive terminal
while loop and not fail:
    command = input()
    if command=="exit" or command=="exit()": # Keywords to leave the engine
        loop=False
    else:
        try:
            eng.eval(command, nargout=0) # Feed the instructions to Matlab eval
        except: # The exceptions are actually handled by Matlab
            pass

if not fail:
    eng.quit()