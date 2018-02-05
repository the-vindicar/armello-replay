import sys
from os import path
import xml.etree.ElementTree as ET

try: #minify JS files if possible
    from jsmin import jsmin
    jsmin_available = True
except ImportError: #leave them alone if not    
    def jsmin(s):
        return s
    jsmin_available = False
#
try: #minify CSS files if possible
    from cssmin import cssmin
    cssmin_available = True
except ImportError: #leave them alone if not
    def cssmin(s):
        return s
    cssmin_available = False
#

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print 'Usage: '+path.basename(sys.argv[0])+' source.html destination.html'
        print 'Takes source file and replaces all references to external JS and CSS files with the contents of those files.'
        print 'Results are written to the destination file.'
        if jsmin_available:
            print 'JavaScript files will be minified.'
        else:
            print 'JavaScript files will not be minified, since jsmin module is not found.'
        if cssmin_available:
            print 'CSS files will be minified.'
        else:
            print 'CSS files will not be minified, since cssmin module is not found.'
        sys.exit(0);
    srcpath = sys.argv[1]
    dstpath = sys.argv[2]
    basepath = path.dirname(path.abspath(srcpath))
    dom = ET.parse(srcpath)
    root = dom.getroot()
    head = root.find('head')
    # replace CSS links with <style> tags
    for link in list(head.findall(".//link[@rel='stylesheet']")):
        href = link.get("href")
        print "Replacing CSS reference: "+href
        try:
            with open(path.join(basepath, href), 'rt') as cssfile:
                css = cssmin(cssfile.read())
            print "\tInserting "+str(len(css))+" bytes."
            style = ET.Element('style')
            style.text = css.decode('utf8')
            linkidx = list(head).index(link)
            head.remove(link)
            head.insert(linkidx, style)
        except Exception as E:
            print "Failed to replace CSS reference: "+href
            print "Reason: "+str(E)
    #replace JS links with inline JS
    for script in list(head.findall(".//script[@src]")):
        href = script.get('src')
        print "Replacing JS reference: "+href
        try:
            with open(path.join(basepath, href), 'rt') as jsfile:
                js = jsmin(jsfile.read())
            print "\tInserting "+str(len(js))+" bytes."
            script.attrib.pop('src')
            script.text = js.decode('utf8')
        except Exception as E:
            print "Failed to replace JS reference: "+href
            print "Reason: "+str(E)
    #with open(dstpath, 'wt') as dst:
    #    dst.write(ET.tostring(root, encoding="utf8", method="html"))
    dom.write(dstpath, encoding="utf8", method="html")
#