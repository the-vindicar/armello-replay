//================================================================================================
function FileProcessor(zone, handler, color1, color2)
{
	this.zone = zone;
	if (zone.hasAttribute('for'))
		this.input = document.getElementById(zone.getAttribute('for'));
	this.handler = handler;
	this.color1 = color1;
	this.color2 = color2;
	this.zone.addEventListener('click', FileProcessor.prototype.Click.bind(this), false);
	this.zone.addEventListener('dragover', FileProcessor.prototype.DragFileOver.bind(this), false);
	this.zone.addEventListener('drop', FileProcessor.prototype.FileDropped.bind(this), false);
	this.zone.addEventListener('dragend', FileProcessor.prototype.FileDragEnd.bind(this), false);
	this.zone.addEventListener('dragexit', FileProcessor.prototype.FileDragExit.bind(this), false);
	this.update = FileProcessor.prototype.update.bind(this);
}
FileProcessor.prototype = Object.create({});
FileProcessor.prototype.disable = function()
{
	if (('input' in this) && !this.input.hasAttribute('disabled'))
		this.input.setAttribute('disabled', 'true');
};
FileProcessor.prototype.enable = function()
{
	if (('input' in this) && this.input.hasAttribute('disabled'))
		this.input.removeAttribute('disabled');
};
FileProcessor.prototype.Click = function(evt)
{
	if (('input' in this) && this.input.hasAttribute('disabled'))
		evt.preventDefault();
};
FileProcessor.prototype.DoNothing = function(evt) {evt.preventDefault();}
FileProcessor.prototype.DragFileOver = function(evt)
{
	evt.preventDefault();
	var cls = this.zone.hasAttribute('class') ? this.zone.getAttribute('class') : '';
	if (!/\bdrag\b/.test(cls))
		this.zone.setAttribute('class', cls+' drag');
};
FileProcessor.prototype.FileDragExit = function(evt)
{
	evt.preventDefault();
	this.zone.setAttribute('class',this.zone.getAttribute('class').replace(/\s*drag\b/,''));
};
FileProcessor.prototype.FileDropped = function (evt)
{
	evt.preventDefault();
	if (document.getElementById('log').hasAttribute('disabled')) return;
	this.zone.setAttribute('class',this.zone.getAttribute('class').replace(/\s*drag\b/,''));
	var file;
	var dt = evt.dataTransfer;
	if (dt.items) // Use DataTransferItemList interface to access the file(s)
	{
		for (let i = 0; i < dt.items.length; i++)
			if (dt.items[i].kind === 'file')
			{
				file = dt.items[i].getAsFile();
				break;
			}
	}
	else // Use DataTransfer interface to access the file(s)
	{
		if (dt.files.length > 0)
			file = dt.files[0];
	}
	if (typeof file !== 'undefined')
		this.handler(file, this.update);
};
FileProcessor.prototype.FileDragEnd = function (evt)
{
	var dt = evt.dataTransfer;
	if (dt.items)
		// Use DataTransferItemList interface to remove the drag data
		for (var i = 0; i < dt.items.length; i++) 
			dt.items.remove(i);
	else
		// Use DataTransfer interface to remove the drag data
		dt.clearData();
};
FileProcessor.prototype.update = function (rate, message)
{
	this.zone.style.background = "linear-gradient(90deg, "+this.color1+", "+this.color1+" "+rate+"%, "+this.color2+" "+rate+"%, "+this.color2+")";
	if (typeof message !== 'undefined')
		this.zone.innerHTML = message;
};
//================================================================================================
// reaction to log file being selected by user
function LogFileSelected(file, update)
{
	document.getElementById('log').setAttribute('disabled','true');
	var recommendedParser;		
	// clear any existing list items
	let items = document.getElementById('matches');
	while (items.firstChild) items.removeChild(items.firstChild);
	update(0, "Looking for matches in "+file.name);
	Parser.provideParserForFile(file) //try to pick a parser to use on this file
		.then(function(parser) // we were able to select a parser
		{
			recommendedParser = parser; // remember it
			// use it to find matches in the log
			return parser.findMatches(file, function (line, pos) 
			{
				update((100.0 * pos) / file.size); // update the progress bar as we go through the file
			}); 
		})
		.then(function(matches) // matchfinder function successfully retrieved a list of matches
		{
			if (matches.length > 0) // at least one match has been found
			{
				for (var i = 0; i < matches.length; i++)
				{
					// create a list item describing the match
					let item = document.createElement('li');
					// load match button
					let btn = document.createElement('button');
					btn.setAttribute('class', 'loadmatch');
					btn.innerHTML = 'Load';
					item.appendChild(btn);
					// we attach references to the recommended parser and the file slice straight to the button
					btn.dataslice = file.slice(matches[i].startpos, matches[i].endpos);
					btn.parser = recommendedParser;
					
					let starttime = matches[i].starttime.split(':').map(function(x){return parseInt(x,10)});
					let endtime = matches[i].endtime.split(':').map(function(x){return parseInt(x,10)});
					let duration = (endtime[0]*3600 + endtime[1]*60 + endtime[2]) - (starttime[0]*3600 + starttime[1]*60 + starttime[2]);
					if (duration < 0) duration += 24*3600;
					let hours = Math.trunc(duration / 3600).toString();
					let minutes = ('0'+Math.trunc((duration % 3600) / 60).toString()).slice(-2);
					let seconds = ('0'+Math.trunc(duration % 60).toString()).slice(-2);
					let durationspan = document.createElement('span');
					durationspan.setAttribute('class', 'match-duration');
					durationspan.innerHTML = hours + ':' + minutes + ':' + seconds;
					item.appendChild(durationspan);
					// append player names and their chosen heroes
					for (var p = 0; p < 4; p++)
					{
						let block = document.createElement('span');
						block.setAttribute('class','participant');
						let s = sanitize(matches[i].players[p].name);
						// turn name into a link to steam profile, if available.
						if ((typeof matches[i].players[p].steam !== 'undefined') && (matches[i].players[p].steam != '0'))
							s = '<a href="https://steamcommunity.com/profiles/'+matches[i].players[p].steam+'">'+s+'</a>';
						// add chosen hero, if available
						if (typeof matches[i].players[p].hero !== 'undefined')
							s += "("+Name(matches[i].players[p].hero)+")";
						block.innerHTML = s;
						item.appendChild(block);
					}
					items.appendChild(item);
				}
				// let user know we are done
				update(100, "Please choose a match to be loaded, or select another file.");
			}
			else // no matches have been found
			{
				update(100, "No matches found! Please select another file.");
			}
			document.getElementById('log').removeAttribute('disabled');
		})
		.catch(function(err) // something went awry
		{
			update(0, "Parsing error: "+err.toString());
			document.getElementById('log').removeAttribute('disabled');
			console.error(err);
		});	
}
//================================================================================================
// reaction to user having selected a match to load
function MatchSelected(file, parser, update)
{
	document.getElementById('log').setAttribute('disabled','true');
	update(0, "Extracting events...");
	// first, we extract events into array of event objects.
	parser.parseFile(file, function (line, pos) 
	{
		update((75.0 * pos) / file.size); // update the progress bar as we go through the file
	})
		.then(function (events) // events have been extracted
		{
			var snapshots = [];
			var list = document.getElementById('turns'); // event log
			var gamebegan = false;
			var i=0; // index of current event
			update(75, "Analyzing events...");
			// in order to NOT hang up the browser for the duration of the processing, we process one event at a time 
			// and let the browser take care of its business in between
			var processSomeEvents = function(resolve, reject)
			{
				try
				{
					// process no more than 50 events in one go
					let target = Math.min(events.length, i+50);
					while (i < target)
					{
						window.ArmelloMatchState.processEvent(events[i]); // processing another event
						if (!gamebegan && (events[i].name === 'nextRound'))
							gamebegan = true;
						let desc = describeEvent(events[i]); // trying to get a description
						if (gamebegan && (typeof desc !== 'undefined')) // event has a description - add it
						{
							let li = document.createElement('li');
							li.innerHTML = desc;
							// save index in the event array - that lets us find it later
							li.setAttribute('data-event-index', i);
							// mark the element with event type for styling purposes
							li.setAttribute('class', 'event event-'+events[i].name);
							// mark the element with turntaker clan for styling purposes
							let turntakerid = window.ArmelloMatchState.context.active;
							let turntaker = (turntakerid)
								? window.ArmelloMatchState.entities.getItemById('id', turntakerid)
								: undefined;
							if (turntaker)
							{
								if (turntaker.type.slice(0,4) === 'Bear')
									li.setAttribute('class', li.className+' Bear')
								else if (turntaker.type.slice(0,6) === 'Rabbit')
									li.setAttribute('class', li.className+' Rabbit')
								else if (turntaker.type.slice(0,3) === 'Rat')
									li.setAttribute('class', li.className+' Rat')
								else if (turntaker.type.slice(0,4) === 'Wolf')
									li.setAttribute('class', li.className+' Wolf')
								else if (turntaker.type.slice(0,6) === 'Bandit')
									li.setAttribute('class', li.className+' Bandit')
								else if (turntaker.type.slice(0,4) === 'King') //both King and KingsGuard
									li.setAttribute('class', li.className+' King')
								else if (turntaker.type.slice(0,4) === 'Bane')
									li.setAttribute('class', li.className+' Bane')
							}
							// we make a snapshot and save its index in the snapshot array at:
							// a) the beginning of a day or night
							// b) the beginning of someone's (player/king/guard/bane) turn
							// while we could reduce the amount of snapshots we make, thus reducing file size by 50%,
							// it leads to having to process more events each jump, introducing UI lag 
							if ((events[i].name === 'nextRound') || (events[i].name === 'startTurn'))
							{
								let index = snapshots.push(window.ArmelloMatchState.getSnapshot()) - 1;
								li.setAttribute('data-snapshot-index', index);
							}
							list.appendChild(li);
						}
						i++;
					}
					update(75 + (25.0 * i) / events.length); // update the progress bar
					if (i < events.length) // there are more events to go
						// we ask to run this function again at the browser's earliest convenience
						setTimeout(function () {processSomeEvents(resolve, reject);}, 0); 
					else // no more events left
						resolve({events:events, snapshots:snapshots}); // signal that we are done
				}
				catch (err) // something went wrong, we have to stop
				{
					reject(err);
				}
			};
			// we use Promise to find out when all events have been processed
			return new Promise(processSomeEvents);
		})
		.then(function(data) // all events have been successfully processed and stored
		{
			let storage = document.createElement('script');
			storage.innerHTML = 
				"window.ArmelloMatchEvents = "+JSON.stringify(data.events).replace(/</g, '\\u003c')+";\r\n"+
				"window.ArmelloMatchSnapshots = "+JSON.stringify(data.snapshots).replace(/</g, '\\u003c')+";";
			document.head.appendChild(storage);
			switchToMainView();
			let first = document.querySelector('#turns *[data-snapshot-index]')
			jumpToEvent(first.getAttribute('data-event-index'), true);
		})
		.catch(function(err) // something went wrong
		{
			let log = document.getElementById('log')
			if (log) log.removeAttribute('disabled');
			update(0, "Parsing error: "+err.toString());
			console.error(err);
		});	
}
