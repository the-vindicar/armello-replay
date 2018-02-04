import re
import os
import glob
mask = r"%APPDATA%\..\LocalLow\League of Geeks\Armello\logs\*_log_*.txt"
dates = [ (fname,os.stat(fname).st_mtime) for fname in glob.iglob(os.path.expandvars(mask)) ]
dates.sort(key= lambda (fname, timestamp): timestamp, reverse=True)
if dates:
    fname = os.path.abspath(dates[0][0])
else:
    raise Exception("No logs found at the specified location: {0}".format(mask))
regexp = re.compile("Matchmaking: All amulets: (\w+), \w+, \w+, \w+")
with open(fname, "rt") as f:
    print "Ready!"
    while True:
        where = f.tell() #remember our current position
        line = f.readline().decode('utf-8') #try to read a line
        if line: #if we could read a full line
            m = regexp.search(line)
            if m is not None:
                print m.group(1)
        else: # we could not read a full line
            f.seek(where)
