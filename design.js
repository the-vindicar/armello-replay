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
		case "chat": 
		{
			let s = evt.message.replace(/\[url="herotooltip:\/\/(\w+?)"\].+?\[\/url\]|\[.+?\]/ig, function (a,b) 
			{
				if (b)
					return describeEntity(context.entities.getItemById('type', b));
				else
					return '';
			});
			return describeEntity(context.players.getItemById('id', evt.player).hero)+' ['+evt.type+']: '+s; 
		}; break;
		default: return undefined; break;
	}
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
