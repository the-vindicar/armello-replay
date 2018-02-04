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
function describeEntity(entity) 
{ 
	if (!(entity instanceof Entity))
		entity = window.ArmelloMatchState.entities.getItemById('id', entity);
	return '<span class="entity" data-id="'+entity.id+'">'+Name(entity.type)+'</span>'; 
}
function describeTile(tile) 
{
	if (!(tile instanceof MapTile))
		tile = window.ArmelloMatchState.map.getItemById('coords', tile);
	return '<span class="tile" data-id="'+tile.coords+'">'+Name(tile.type)+' at '+tile.coords+'</span>'; 
}

function describeEvent(evt)
{
	let context = window.ArmelloMatchState;
	switch (evt.name)
	{
		case "moveEntity": return describeEntity(evt.entity)+' moves to '+describeTile(evt.coords)+'.'; break;
		case "attack": return describeEntity(evt.attacker)+' attacks '+describeEntity(evt.defender)+'!'; break;
		case "killEntity": 
		{
			let ent = context.entities.getItemById('id', evt.entity);
			if (ent instanceof Hero)
				return describeEntity(ent)+' returns to the Clan Grounds.';
			else
				return describeEntity(ent)+' dies.';
		}; break;
		case "equipCard": 
		{
			let ent = context.entities.getItemById('id', evt.entity);
			if (ent instanceof Hero)
				return describeEntity(ent)+(evt.card.slice(0,3)=='FOL'?' recruits ':' equips ')+PCard(evt.card)+'.';
			else
				return undefined;
		}; break;
		case "unequipCard":
		{
			let ent = context.entities.getItemById('id', evt.entity);
			if (!(ent instanceof Hero)) return;
			switch (evt.reason)
			{
				case 'Discarded': return describeEntity(ent)+' discards '+PCard(evt.card)+'.'; break;
				case 'Stolen': return describeEntity(ent)+' has their '+PCard(evt.card)+' stolen from them!'; break;
				case 'Fickle': return PCard(evt.card)+' leaves '+describeEntity(ent)+'.'; break;
				default: return describeEntity(ent)+' loses '+PCard(evt.card)+'.'; break;
			}
		}; break;
		case "gainCard": return describeEntity(context.players.getItemById('id', evt.player).hero)+' gets "'+PCard(evt.card)+'".'; break;
		case "loseCard": return describeEntity(context.players.getItemById('id', evt.player).hero)+' loses "'+PCard(evt.card)+'" from their hand.'; break;
		case "playCardOnCreature": return describeEntity(evt.entity1)+' plays '+PCard(evt.card)+' on '+describeEntity(evt.entity2); break;
		case "playCardOnTile": return describeEntity(evt.entity)+' plays '+PCard(evt.card)+' on '+describeTile(evt.coords); break;
		case "changeStats": 
		{
			let ent = context.entities.getItemById('id', evt.entity);
			if (ent.type && (evt.stat in ent))
			{
				if ((evt.stat === "Health") && (ent.Health == 0))
					return describeEntity(ent)+(evt.delta>0 ? ' gains ' : ' loses ')+Math.abs(evt.delta).toString()+' '+evt.stat+' and dies.';
				else
					return describeEntity(ent)+(evt.delta>0 ? ' gains ' : ' loses ')+Math.abs(evt.delta).toString()+' '+evt.stat+'.';
			}
			else
				return undefined;
		}; break;
		case "gainPact": return describeEntity(context.players.getItemById('id', evt.player1).hero)+' plays "'+PCard(evt.card)+'" on '+describeEntity(context.players.getItemById('id', evt.player2).hero)+'.'; break;
		case "toggleBounty": 
		{
			let ent = context.entities.getItemById('id', evt.entity);
			if (ent.bounty > 0)
				return "There is a bounty on "+describeEntity(ent)+"'s head!";
			else
				return "There is no longer a bounty on "+describeEntity(ent)+"'s head.";
		}; break;
		case "toggleCorrupted": 
		{
			let ent = context.entities.getItemById('id', evt.entity);
			if (ent instanceof Hero)
				if (ent.corrupted)
					return describeEntity(ent)+" has been corrupted by Rot!";
				else
					return describeEntity(ent)+" is no longer corrupted.";
			
		};break;
		// Map tiles
		case "putPeril": 
		{
			let ent = (evt.owner < 5) 
				? context.players.getItemById('id', evt.owner).hero 
				: context.entities.getItemById('id', evt.owner);
			return describeEntity(ent)+' puts '+PCard(evt.card)+' at '+describeTile(evt.coords)+'.'; 
		}; break;
		case "encounterPeril":
		{
			let tile = context.map.getItemById('coords', evt.coords);
			let hero = context.entities.getItemById('id', evt.entity);
			return describeEntity(hero)+' encounters '+PCard(tile.perilcard)+' at '+describeTile(evt.coords)+'.';
		}; break;
		// Other
		case "prestigeLeader": return describeEntity(context.players.getItemById('id', evt.player).hero)+' is now prestige leader!'; break;
		case "declaration": return 'Declaration "'+PDecl(evt.type)+'" is now in effect!'; break;
		case "playerQuit": return context.players.getItemById('id', evt.player).name+' has quit the game.'; break;
		case "startTurn": return "It's now "+describeEntity(context.entities.getItemById('id', evt.entity))+"'s turn."; break;
		case "nextRound": return ((context.context.round % 2 == 0) ? "Day " : "Night ")+(Math.floor(context.context.round / 2) + 1).toString(); break;
		case "victory": return context.players.getItemById('id', evt.player).name+' wins the game!'; break;
		default: return undefined; break;
	}
}
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
					// append player names and their chosen heroes
					for (var p = 0; p < 4; p++)
					{
						let block = document.createElement('span');
						block.setAttribute('class','participant');
						let s = matches[i].players[p].name;
						// turn name into a link to steam profile, if available.
						if (typeof matches[i].players[p].steam !== 'undefined')
							s = '<a href="https://steamcommunity.com/profiles/'+matches[i].players[p].steam+'">'+s+'</a>';
						// add chosen hero, if available
						if (typeof matches[i].players[p].hero !== 'undefined')
							s += "("+Name(matches[i].players[p].hero)+")";
						block.innerHTML = s;
						item.appendChild(block);
					}
					items.appendChild(item);
				}
			else // no matches have been found
			{
				let item = document.createElement('li');
				item.innerHTML = "No matches found!";
				items.appendChild(item);
			}
			// let user know we are done
			update(100, "Please choose a match to be loaded, or select another file.");
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
							// if it's a beginning of a turn, we make a snapshot and save its index in the snapshot array
							if ((events[i].name === 'startTurn') || (events[i].name === 'nextRound'))
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
				"window.ArmelloMatchEvents = "+JSON.stringify(data.events)+";\r\n"+
				"window.ArmelloMatchSnapshots = "+JSON.stringify(data.snapshots)+";";
			document.head.appendChild(storage);
			switchToMainView();
			window.ArmelloMatchState.loadSnapshot(data.snapshots[0]);
			let lst = document.getElementById('turns');
			lst.children[0].setAttribute('selected', 'true');
			lst.children[0].scrollIntoView(true);
		})
		.catch(function(err) // something went wrong
		{
			let log = document.getElementById('log')
			if (log) log.removeAttribute('disabled');
			update(0, "Parsing error: "+err.toString());
			console.error(err);
			console.log(window.ArmelloMatchState);
		});	
}
//================================================================================================
function updateHeroFor(player)
{
	let id = player.id;
	let hero = player.hero;
	if (!hero) return;
	document.querySelector('#players .info[data-player-id="'+id+'"] .hero').innerHTML = ' as '+Name(hero.type);
	let cell = document.querySelector('#players .player[data-player-id="'+id+'"]');
	cell.setAttribute('data-clan', hero.type.slice(0, -2));
	for (let i = 0; i<3; i++)
	{
		let item = cell.querySelector('.equipped .items[data-index="'+i.toString()+'"]');
		item.innerHTML = hero.equipment[i] ? Name(hero.equipment[i]) : '-';
		let follower = cell.querySelector('.equipped .followers[data-index="'+i.toString()+'"]');
		follower.innerHTML = hero.followers[i] ? Name(hero.followers[i]) : '-';
	}
	let stats = cell.querySelectorAll('.stats *[data-stat]');
	for (let i = 0; i<stats.length; i++)
	{
		let stat = stats[i].getAttribute('data-stat');
		if (stat in hero)
			stats[i].innerHTML = hero[stat].toString();
	}
	let eff = hero.effects.filter(function(val)
	{
		return (val !== 'TRK_DISCOUNT') && (val !== 'DEFAULT_STEALTH') && (val.slice(0,3) !== 'CLN') && (val.slice(0,3) !== 'POW') && (hero.equipment.indexOf(val) < 0) && (hero.followers.indexOf(val) < 0);
	});
	cell.querySelector('.effects').innerHTML = eff.map(Name).join('; ');
	cell.querySelector('.hand').innerHTML = player.hand.map(Name).join('; ');
	
	let caption = document.querySelector('#players .info[data-player-id="'+id+'"]');
	if ((hero.SpiritStones >= 4) && !/\bspiritwalker\b/i.test(caption.getAttribute('class')))
		caption.setAttribute('class', caption.getAttribute('class')+' spiritwalker');
	else if ((hero.SpiritStones < 4) && /\bspiritwalker\b/i.test(caption.getAttribute('class')))
		caption.setAttribute('class', caption.getAttribute('class').replace(/\s*spiritwalker/i, ''));
	
	let king = window.ArmelloMatchState.entities.getItemById('type', 'King');
	if ((hero.Rot > king.Rot) && !/\brotten\b/i.test(caption.getAttribute('class')))
		caption.setAttribute('class', caption.getAttribute('class')+' rotten');
	else if ((hero.SpiritStones <= king.Rot) && /\brotten\b/i.test(caption.getAttribute('class')))
		caption.setAttribute('class', caption.getAttribute('class').replace(/\s*rotten/i, ''));
}

function ContextChanged(context, propname, action, value)
{
	if (propname != 'prestige_leader') return;
	for (let id = 1; id <= 4; id++)
	{
		let caption = document.querySelector('#players .info[data-player-id="'+id+'"]');
		if ((context.prestige_leader == id) && !/\bprestigeleader\b/i.test(caption.getAttribute('class')))
			caption.setAttribute('class', caption.getAttribute('class')+' prestigeleader');
		else if ((context.prestige_leader != id) && /\bprestigeleader\b/i.test(caption.getAttribute('class')))
			caption.setAttribute('class', caption.getAttribute('class').replace(/\s*prestigeleader/i, ''));
	}
}

function PlayersChanged(players, propname, propaction, player, property, action, value)
{
	if ((propaction === 'change') && (typeof player === 'undefined'))
	{
		for (let id = 1; id <= 4; id++)
		{
			let plr = players.getItemById('id',id);
			let caption = document.querySelector('#players .info[data-player-id="'+id+'"] a');
			caption.parentNode.setAttribute('data-clan', plr.hero.type.slice(0, -2))
			caption.innerHTML = '['+id.toString()+'] '+plr.name;
			caption.setAttribute('href', 'https://steamcommunity.com/profiles/'+plr.steam);
			updateHeroFor(plr);
		}
	}
	else
		updateHeroFor(player);
}

function OnUpdate(context, prop, action, value)
{
	if ((prop == 'players') || (prop == 'entities') || (prop == 'map') || (prop == 'markers'))
		renderMap(document.getElementById('map'), context);
}
//================================================================================================
function EventClicked(evt)
{
	// determine which event has been selected
	let target = evt.target;
	while (!/\bevent\b/.test(target.className) && (target.id !== 'turns'))
		target = target.parentNode;
	// if click isn't on an event, or if the event is already selected, do nothing
	if ((target.id === 'turns') || target.hasAttribute('selected')) return;
	evt.preventDefault();
	// determine current selected event node and event index
	let current = document.querySelector('#turns *[selected]');
	// event index of the currently selected event
	let currentidx = parseInt(current.getAttribute('data-event-index'), 10);
	// event index of the newly selected event
	let eventidx = parseInt(target.getAttribute('data-event-index'), 10);
	// look for the snapshot immediately preceding the newly selected event
	let statenode = target; // finding the event node
	while (statenode && !statenode.hasAttribute('data-snapshot-index'))
		statenode = statenode.previousElementSibling;
	if (!statenode) throw new Error("No state snapshot found!");
	// determine snapshot index
	let snapshotidx = parseInt(statenode.getAttribute('data-snapshot-index'), 10);
	// determine index of the event, after which the snapshot was done
	let starteventidx = parseInt(statenode.getAttribute('data-event-index'), 10);
	// if snapshot is ahead of the currently selected event, or 
	// if the newly selected event is behind the currently selected event
	if ((starteventidx > currentidx) || (eventidx < currentidx))
		// then we should restore the snapshot first and go from there
		window.ArmelloMatchState.loadSnapshot(window.ArmelloMatchSnapshots[snapshotidx]);
	else // otherwise, both events are within the same snapshot chunk, and we can simply go forward.
		starteventidx = currentidx; // starting with the currently selected event
	// apply all events until we reach the one we are interested in.
	for (let i = starteventidx+1; i <= eventidx; i++)
		window.ArmelloMatchState.processEvent(window.ArmelloMatchEvents[i]);
	// unmark currently selected event
	current.removeAttribute('selected');
	// mark newly selected event
	target.setAttribute('selected','true');
}

function EventHover(evt)
{
	if (/\bentity|tile\b/.test(evt.target.className))
	{
		evt.preventDefault();
		let target = evt.target.getAttribute('data-id');
		if (EventHover.target != target)
		{
			let t = (/\btile\b/.test(evt.target.className))
				? window.ArmelloMatchState.map.getItemById('coords', target, false)
				: window.ArmelloMatchState.entities.getItemById('id', target, false);
			renderMap(document.getElementById('map'), window.ArmelloMatchState, t);
			EventHover.target = target;
		}
	}
	else if (typeof EventHover.target !== 'undefined')
	{
		evt.preventDefault();
		EventHover.target = undefined;
		renderMap(document.getElementById('map'), window.ArmelloMatchState, undefined);
	}
}
EventHover.target = undefined;

function MapHover(evt)
{
	let rect = evt.target.getBoundingClientRect();
	let x = (evt.clientX - rect.left) * parseInt(evt.target.getAttribute('width'),10) / rect.width;
	let y = (evt.clientY - rect.top) * parseInt(evt.target.getAttribute('height'),10) / rect.height;
	let rx = window.innerWidth - evt.clientX + 5;
	let by = window.innerHeight - evt.clientY + 5;
	let tooltip = document.getElementById('maptooltip');
	let entity, marker, tile;
	if (entity = getItemAt(window.ArmelloMatchState.entities, x, y, 0.5))
	{
		if (entity.item instanceof Hero)
			tooltip.innerHTML = Name(entity.item.type)+"<br />"+window.ArmelloMatchState.players.getItemById("id",entity.item.playerid).name;
		else
			tooltip.innerHTML = Name(entity.item.type);
		tooltip.style = "visibility:visible; right:"+rx.toString()+"px; bottom:"+by.toString()+"px";
	}
	else if (marker = getItemAt(window.ArmelloMatchState.markers, x, y, 0.7))
	{
		tooltip.innerHTML = marker.item.title;
		tooltip.style = "visibility:visible; right:"+rx.toString()+"px; bottom:"+by.toString()+"px";
	}
	else if (tile = getItemAt(window.ArmelloMatchState.map, x, y, 1.0))
	{
		let text = describeTile(tile.item);
		if (tile.item.type == "ClanCastle")
			text += "<br />" + window.ArmelloMatchState.players.getItemById("corner", tile.item.corner).name;
		if (tile.item.perilcard)
			text += "<br />" + Name(tile.item.perilcard) 
		if (tile.item.perilbuffs)
			text += "<br />" + tile.item.perilbuffs.map(Name).join(", ");
		tooltip.innerHTML = text;
		tooltip.style = "visibility:visible; right:"+rx.toString()+"px; bottom:"+by.toString()+"px";
	}
	else
	{
		tooltip.innerHTML = "";
		tooltip.style = "";
	}
}

function MapLeave(evt)
{
	let tooltip = document.getElementById('maptooltip');
	tooltip.innerHTML = "";
	tooltip.style = "";
}
//================================================================================================
function deleteIfPresent(selector)
{
	let nodes = document.querySelectorAll(selector);
	for (let i = 0; i < nodes.length; i++)
		nodes[i].parentNode.removeChild(nodes[i]);
}

function switchToMainView()
{
	// destroy loader window, if present
	deleteIfPresent('#load');
	// remove parser scripts, if present - we won't need them anymore
	deleteIfPresent('script[data-loader]');
	// show main window
	document.getElementById('main').removeAttribute('style');
	// reconfigure canvas
	let canvas = document.getElementById('map');
	canvas.setAttribute('width', gridToCanvas.GridWidth + 2 * gridToCanvas.xOffset);
	canvas.setAttribute('height', gridToCanvas.GridHeight + 2 * gridToCanvas.yOffset);
	canvas.addEventListener('mousemove', MapHover, false);
	canvas.addEventListener('mouseleave', MapLeave, false);
	window.ArmelloMatchState.players.subscribe(PlayersChanged);
	window.ArmelloMatchState.context.subscribe(ContextChanged);
	window.ArmelloMatchState.subscribe(OnUpdate);
	let turns = document.getElementById('turns');
	turns.addEventListener('click', EventClicked, false);
	turns.addEventListener('mouseover', EventHover, false);
}
//================================================================================================
window.addEventListener('load', function(evt) {
	window.ArmelloMatchState = new MatchState(); // this object holds match state
	if (('ArmelloMatchEvents' in window) && ('ArmelloMatchSnapshots' in window))
	{
		// we detect match data already present - the page must've been saved in match view mode
		switchToMainView();
		console.log("Let's restart this puppy...");
		// detect which event is currently selected
		let current = document.querySelector('#turns *[selected]');
		// look for the snapshot immediately preceding the selected event
		let statenode = current; // finding the event node
		while (statenode && !statenode.hasAttribute('data-snapshot-index'))
			statenode = statenode.previousElementSibling;
		if (!statenode) throw new Error("No state snapshot found!");
		// event index of the currently selected event
		let currentidx = parseInt(current.getAttribute('data-event-index'), 10);
		// determine snapshot index
		let snapshotidx = parseInt(statenode.getAttribute('data-snapshot-index'), 10);
		// determine index of the event, after which the snapshot was done
		let starteventidx = parseInt(statenode.getAttribute('data-event-index'), 10);
		// restore the snapshot first and go from there
		window.ArmelloMatchState.loadSnapshot(window.ArmelloMatchSnapshots[snapshotidx]);
		// apply all events until we reach the current one 
		for (let i = starteventidx+1; i <= currentidx; i++)
			window.ArmelloMatchState.processEvent(window.ArmelloMatchEvents[i]);
		current.scrollIntoView(true);
	}
	else // we detect no match data or it's incomplete - we configure loader form instead
	{
		// initialize file uploader
		var fproc = new FileProcessor(document.getElementById('dropzone'), LogFileSelected, "#CCCCCC", "transparent");
		// react to file being selected
		document.getElementById('log').addEventListener('change', function(evt)
		{
			LogFileSelected(evt.target.files[0], fproc.update);
		}, false);
		// react to user selecting a match to load
		document.getElementById('matches').addEventListener('click', function(evt){
			// disable all load buttons first to avoid re-entering
			if (!evt.target.className.match(/\bloadmatch\b/i) || evt.target.hasAttribute('disabled')) return;
			var buttons = document.getElementById('load').querySelectorAll('.loadmatch');
			for (let i = 0; i < buttons.length; i++)
				buttons[i].setAttribute('disabled','true');
			// load match data
			MatchSelected(evt.target.dataslice, evt.target.parser, fproc.update);
		}, false);
		let os;
		if (/^win/i.test(window.navigator.platform)) os = 'windows';
		else if (/^Mac/i.test(window.navigator.platform)) os = 'mac';
		else if (/^Linux/i.test(window.navigator.platform)) os = 'linux';
		else os = 'unknown';
		let logpath = document.getElementById('logpath');
		switch (os)
		{
			case 'windows': logpath.innerHTML = "%APPDATA%\\..\\LocalLow\\League of Geeks\\Armello\\logs\\"; break;
			case 'linux': logpath.innerHTML = "~/.config/unity3d/League of Geeks/Armello/logs"; break;
			case 'mac': logpath.innerHTML = "~/Library/Application Support/League of Geeks/Armello/logs"; break;
			default: logpath.innerHTML = 'your user profile, somewhere'; break;
		}
	}
}, false);
