//===============================================================================================================
// ParserItem is supposed to recognize one line type and transform it into one event
// owner is a reference to Parser object that uses it.
// name is a string used as the value of name property of the event object ParserItem generates.
// re is a regular expression used to recognize the line and extract data from it
// map is an array of property names in resulting event object. 
// 		Property named after i-th element of this array will have the value of i+1-th capture group.
//		It would be unnecessary if JS supported named groups in regular expressions.
// action is a function that finalizes the event object before it's returned. 
// 		Necessary for certain events due to them requiring additional logic.
//		It takes one argument - event object to finalize, and returns the finalized object.
//		If action is not a function, event object is returned as is.
//		If action function returns undefined, then event is ignored.
//		Action function is called in the context of data object of owner Parser object. This allows multiple ParserItems to share data.
function ParserItem(owner, name, re, map, action, log)
{
	this.name = name;
	this.owner = owner;
	this.action = action;
	this.regexp = re;
	this.map = map;
	this.log = log;
	this.action = (typeof this.action === 'function') ? action : ParserItem.prototype._noop;
}
ParserItem.prototype = Object.create({});
ParserItem.prototype.constructor = ParserItem;
// Simple noop function that's substituted as action for items without one.
ParserItem.prototype._noop = function (evt){return evt;};
// Attempts to match the line against the pattern of this ParserItem. 
// If match is found, attempts to construct an event object.
// line is a string containing one line of the log file.
ParserItem.prototype.run = function (line)
{
	var match;
	if (match = line.match(this.regexp))
	{
		var evt = {};
		// sadly, JS doesn't support named groups in regular expressions
		// so we have to generate event object based on provided map instead
		for (var i = 0; i < this.map.length; i++)
			evt[this.map[i]] = match[i+1];
		evt.name = this.name;
		// finalize the event object using action provided.
		// finalizer is called in the context of data object of owner Parser object, thus allowing multiple ParserItems to share data
		evt = this.action.call(this.owner.data, evt);
		if (this.log)
		{
			console.log(line);
			console.log(evt);
		}
		return evt;
	}
	else // return undefined if there were no match
		return;
};
//===============================================================================================================
// Parser transforms certain lines of the log into arrays of event objects.
// This class provides basis for multiple instances, each suited to parse logs of specific app version.
// All Parser instances should be placed in Parser.Parsers object for them to be considered during parser selection.
// fields is an object that initializes additional data stored in the Parser object that can be used by ParserItem actions or detectfunc.
// items is an array of objects storing data necessary to initialize ParserItems. 
// 		Objects are expected to have following properties: name, re, map and (optionally) action. See ParserItem constructor.
// detectfunc is a function that will be used to find individual matches (playthroughs) in the log file.
//		detectfunc is expected to take two parameters: line from the log file and position (in bytes) of it's beginning in the file.
//		detectfunc should return either undefined, or an object with information about a single match it found.
//		To allow storing data between detectfunc calls, it's called in the context of fields object.
//		Typically detectfunc should accumulate data on a single match there until it has enough. 
//		At which point it should return the finished object. Object should contain the following properties:
//			starttime - string containing timestamp of match beginning
//			endtime - string containing timestamp of match completion
//			startpos - saved position of match beginning in the log file
//			endpos - saved position of match ending in the log file
//			players - array of four(4) objects describing individual players. 
//				Each object should have at least name property, containing player's in-game name.
//				Additional information, like Steam ID or chosen hero, is welcome but unnecessary.
function Parser(fields, items, detectfunc)
{
	this.data_init = fields;
	this.data = Object.create(fields);
	this.items = [];
	for (var i = 0; i < items.length; i++)
		this.items.push(new ParserItem(this, items[i].name, items[i].re, items[i].map, items[i].action, items[i].log));
	this.matchFinderFunc = detectfunc;
}
Parser.prototype = Object.create({});
Parser.prototype.constructor = Parser;
// Parses a single line from the log and returns an array of event objects generated by ParserItems.
// Lines that doesn't trigger any ParserItem return empty Array object.
Parser.prototype._parseLine = function (line, pos)
{
	var events = [];
	var evt;
	for (var i = 0; i < this.items.length; i++)
	{
		evt = this.items[i].run(line);
		if (typeof evt !== 'undefined')
			events.push(evt);
	}
	return events;
};
Parser.prototype.findMatches = function (file, linecb)
{
	this.data = Object.create(this.data_init);
	let matchfinderfunc = this.matchFinderFunc.bind(this.data);
	if (typeof linecb !== 'function')
		return Parser._scanFile(file, matchfinderfunc);
	else
		return Parser._scanFile(file, function (line, pos)
		{
			linecb(line, pos);
			return matchfinderfunc(line, pos);
		});	
};
// Parses the file using owned collection of ParserItems.
// If provided, linecb callback is called per line as a way to track progress.
// Returns a Promise that resolves with array of accumulated events.
Parser.prototype.parseFile = function (file, linecb)
{
	let linefunc = Parser.prototype._parseLine.bind(this);
	this.data = Object.create(this.data_init);
	if (typeof linecb !== 'function')
		return Parser._scanFile(file, linefunc);
	else
		return Parser._scanFile(file, function (line, pos)
		{
			linecb(line, pos);
			return linefunc(line);
		});
};
// Transforms string of format "1.2.3" into zero-padded 4-element array [1,2,3,0]
// Such arrays can be sorted, and first elements will be more important that last.
Parser._versionToArray = function(v)
{ 
	return (v+'.0.0.0').split('.').slice(0,4)
		.map(function(x){return parseInt(x,10);});
};
// Compares two version arrays
Parser._versionComparer = function (v1, v2)
{
	for (let i = 0; i < v1.length; i++)
		if (v1[i] < v2[i]) return -1;
		else if (v1[i] > v2[i]) return 1;
	return 0;
}
// Find a Parser version (from available versions) that is the closest to the provided version
// version is a string in format "1.4"
Parser._findClosest = function (version)
{
	var temp = [];
	// version to look for
	var ver = Parser._versionToArray(version);
	// all available versions
	var vs = Object.keys(Parser.Parsers).map(Parser._versionToArray);
	// checking version number parts, from major to minor
	for (var n = 0; n < 4; n++) 
	{
		// find all Parsers with particular value in version number equal to the one we seek.
		temp = vs.filter(function (v) { return v[n] == ver[n]; }).sort(Parser._versionComparer); //array of arrays can be sorted!
		if (temp.length == 0) // there are none - try and find the closest one and be done
		{
			// try to find the next version
			let greater = vs.filter(function (v) { return v[n] > ver[n]; }).sort(Parser._versionComparer);
			if (greater.length > 0) // there are Parsers with greater version number - use the first one since it's the closest
				return greater[0].join('.');
			else // All Parsers in vs have smaller version number - use the last one and hope for the best
				return vs[vs.length-1].join('.');
		}
		else if (temp.length == 1) // there is only one match - return it and be done
			return temp[0].join('.');
		else // there are multiple matches - we have to check next value and pick from these
			vs = temp;
	}
	if (temp.length > 0)
		// there are multiple acceptable parsers - this should never happen unless they share first four version number values
		return temp[0];
	else
		// we somehow failed to find a Parser using the logic above
		return undefined;
};
// List of available Parser instances. 
// Keys are version numbers, encoded as "1.2.0.0"
// One instance will be chosen, depending on app version stated in the log file.
Parser.Parsers = {};
// Function accepts a file object and returns a Promise. 
// When Promise is resolved, the best matching instance of Parser is provided as value.
Parser.provideParserForFile = function (file)
{	
	return new Promise(function (resolve, reject) 
	{
		const slicesize = 4*1024; //reading first 4Kb of the file - should be enough to find version number.
		var reader = new FileReader();
		// FileReader does it's job anycronously...
		reader.onloadend = function (event) //once data is accessible
		{ 
			//the only version line that seems to be present for all versions of the game
			var re = /Build\s*ID:[^0-9]+((?:\d+\.)+\d+)-/ig;
			var version;
			//trying to find a match
			var match = re.exec(event.target.result);
			if (match) //found version info
			{
				// tring to find a matching Parser
				var v = Parser._findClosest(match[1]);
				if (typeof v === 'undefined') // failed to find Parser
					reject("No matching parser found for version "+match[1]+"!");
				else // found one!
					resolve(Parser.Parsers[v]);
			}
			else //no version info - log file must be damaged or it's format has changed too much.
				reject("No version info found!");
		};
		//sending read request
		reader.readAsText(file.slice(0, slicesize));
	});
};
// returns the byte length of an utf8 string
Parser._UTF8size = function (str)
{
	var s = str.length;
	for (var i=str.length-1; i>=0; i--) 
	{
		var code = str.charCodeAt(i);
		if (code > 0x7f && code <= 0x7ff) s++;
		else if (code > 0x7ff && code <= 0xffff) s+=2;
		if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
	}
	return s;
};
// Scans provided file line by line, calling linefunc for each line.
// Returns Promise that resolves once the file has been processed and returns array of values returned by linefunc.
// linefunc is called with two parameters: string that contains the line and position in bytes of beginning of that line.
// 		It should return either undefined (line generated no events), an object (one event) or an array (multiple events).
Parser._scanFile = function (file, linefunc)
{
	return new Promise(function (resolve, reject) 
	{
		const slicesize = 64*1024; //read file in chunks of 64kb
		const sz = file.size;
		var position = 0; //start of the current chunk
		var startpos = 0; //start of the current line
		var buffer = ""; //string buffer used to handle strings that span over multiple chunks
		var values = new Array(); //array of values generated by the linefunc
		var reader = new FileReader();
		//FileReader does its job asyncronously
		reader.onloadend = function (evt)
		{
			if (evt.target.error) //something went awry when reading the file
				reject(evt.target.error);
			// put data we've read into the buffer
			buffer += evt.target.result;
			// for each full line in the buffer
			for (var i = buffer.indexOf("\n"); i >= 0; i = buffer.indexOf("\n"))
			{
				//extract the line out of the buffer
				var line = buffer.slice(0, i+1); 
				buffer = buffer.slice(i+1);
				try // try processing it
				{
					let value = linefunc(line, startpos, sz);
					if (typeof value !== 'undefined') //linefunc has returned something - add it to the list
						if (Array.isArray(value))
							Array.prototype.push.apply(values, value);
						else
							values.push(value);
				}
				catch (err) //something went wrong during processing
				{ 
					reject(err); 
					return;
				}
				startpos += Parser._UTF8size(line); // adjust starting position to match the next line
			}
			// done with the chunk
			// adjust starting position of the next chunk
			position += slicesize;
			// are there any data left to read?
			if (position < sz) //yes - queue another read
				reader.readAsText(file.slice(position, position+slicesize));
			else // no - lets finish
			{
				if (buffer.length > 0) //anything left in the buffer?
					try // try processing the remainder
					{
						let value = linefunc(buffer, startpos, sz);
						if (typeof value !== 'undefined') //linefunc has returned something - add it to the list
							if (Array.isArray(value))
								Array.prototype.push.apply(values, value);
							else
								values.push(value);
					}
					catch (err) //something went wrong during processing
					{ 
						reject(err); 
						return;
					}
				resolve(values); //return the collected values
			}	
		};
		//queue first read
		reader.readAsText(file.slice(0, slicesize));
	});
}