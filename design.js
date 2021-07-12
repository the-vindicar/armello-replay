//================================================================================================
function sanitize(s)
{
	return s.replace(/[&<>]/g, function(tag) {return sanitize.tagsToReplace[tag] || tag;});
}
sanitize.tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

function describeEntity(entity) 
{ 
	if (!(entity instanceof Entity))
		entity = window.ArmelloMatchState.entities.getItemById('id', entity);
	return '<span class="entity" data-id="'+entity.id+'">'+Name(entity.type)+'</span>'; 
}

function describeTile(tile) 
{
	let coords;
	if (!(tile instanceof MapTile))
	{
		coords = tile;
		tile = window.ArmelloMatchState.map.getItemById('coords', tile, false);
	}
	if (tile)
		return '<span class="tile" data-id="'+tile.coords+'">'+Name(tile.type)+' at '+tile.coords+'</span>';
	else
		return '<span class="tile" data-id="'+coords+'">'+coords+'</span>';
}

function describeRoll(roll)
{
	return '<span class="roll roll-'+roll.type+' roll-'+roll.source+'" title="'+roll.source+' '+roll.type+'">'+describeRoll.dicemap[roll.symbol]+'</span>';
}
describeRoll.dicemap = {Sword:'x',Shield:'u',Sun:'o',Moon:'c',WyldTree:'y',Rot:'q'};

function describeEvent(evt)
{
	let context = window.ArmelloMatchState;
	switch (evt.name)
	{
		case 'spawnNPC': if (evt.type == 'Bane') return Name(evt.type)+' spawns at '+describeTile(evt.coords); break;
		case 'spawnSpiritStone': return 'Spirit stone spawns at '+describeTile(evt.coords); break;
		case 'moveEntity': return describeEntity(evt.entity)+' moves to '+describeTile(evt.coords)+'.'; break;
		case 'attack': return describeEntity(evt.attacker)+' attacks '+describeEntity(evt.defender)+'!'; break;
		case 'combatEnd': 
		{
			let a = describeEntity(evt.attacker);
			let d = describeEntity(evt.defender);
			let text;
			// choose the text describing the battle depending on the outcome
			switch (evt.outcome)
			{
				case 'Attacking-Lose' : text = d + ' defends against ' + a + '.'; break;
				case 'Defending-PushedBack' : text = a + ' forces ' + d + ' to retreat.'; break;
				case 'Attacking-Defeat' : text = d + ' kills ' + a + '.'; break;
				case 'Defending-Defeat' : text = a + ' kills ' + d + '.'; break;
				case 'Defending-Routed' : text = a + ' drives ' + d + ' before them.'; break;
				case 'Attacking-BothDead' : text = a + ' and ' + d + ' kill each other.'; break;
				default: text = a + ' and ' + d + ' fight each other.'; break;
			};
			// create dice counters
			let adice = evt.attacker_dice.parts.map(function(p){return (p.value>0 ? '+' : '')+p.value.toString()}).join('').slice(1);
			let ddice = evt.defender_dice.parts.map(function(p){return (p.value>0 ? '+' : '')+p.value.toString()}).join('').slice(1);
			// create attacker dice roll lists and separate hits from blocks
			let ahits = evt.attacker_dice.rolls.filter(function (r) {return r.type=='Hit' || r.type=='Pierce' || r.type=='Poison';});
			let ablocks = evt.attacker_dice.rolls.filter(function (r) {return r.type=='Block' || r.type=='Reflect';});
			// reverse the order for attacker, since attackers dice are displayed right to left
			// easier than doing the same with CSS.
			ahits.reverse();
			ablocks.reverse();
			// create defender dice roll lists and separate hits from blocks
			let dhits = evt.defender_dice.rolls.filter(function (r) {return r.type=='Hit' || r.type=='Pierce' || r.type=='Poison';});
			let dblocks = evt.defender_dice.rolls.filter(function (r) {return r.type=='Block' || r.type=='Reflect';});
			// generate tooltip describing the battle
			text += '<table class="roll-tooltip"><tr>';
			// combatant names
			text += '<td class="attacker-name">'+a+'</td>';
			text += '<td class="defender-name">'+d+'</td>';
			text += '</tr><tr>'
			// dice counts
			text += '<td class="attacker">'+adice+'='+evt.attacker_dice.parts.reduce(function(a,b){return a+b.value;},0)+' dice</td>';
			text += '<td class="defender">'+ddice+'='+evt.defender_dice.parts.reduce(function(a,b){return a+b.value;},0)+' dice</td>';
			text += '</tr><tr>'
			// dice hits
			text += '<td class="attacker-dice">'+ahits.map(describeRoll).join('')+'</td>';
			text += '<td class="defender-dice">'+dhits.map(describeRoll).join('')+'</td>';
			text += '</tr><tr>'
			// dice blocks
			text += '<td class="attacker-dice">'+ablocks.map(describeRoll).join('')+'</td>';
			text += '<td class="defender-dice">'+dblocks.map(describeRoll).join('')+'</td>';
			text += '</tr></table>';
			return text;
		}; break;
		case 'killEntity': 
		{
			let ent = context.entities.getItemById('id', evt.entity);
			if (ent instanceof Hero)
				return describeEntity(ent)+' returns to the Clan Grounds.';
			else
				return describeEntity(ent)+' dies.';
		}; break;
		case 'equipCard': 
		{
			let ent = context.entities.getItemById('id', evt.entity);
			if (ent instanceof Hero)
				return describeEntity(ent)+(evt.card.slice(0,3)=='FOL'?' recruits ':' equips ')+PCard(evt.card)+'.';
			else
				return undefined;
		}; break;
		case 'unequipCard':
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
		case 'gainCard': return describeEntity(context.players.getItemById('id', evt.player).hero)+' gets "'+PCard(evt.card)+'".'; break;
		case 'loseCard': return describeEntity(context.players.getItemById('id', evt.player).hero)+' loses "'+PCard(evt.card)+'" from their hand.'; break;
		case 'playCardOnCreature': 
		{
			let ent1 = context.entities.getItemById('playerid', evt.player);
			let ent2 = context.entities.getItemById('id', evt.entity);
			return describeEntity(ent1)+' plays '+PCard(evt.card)+' on '+describeEntity(ent2); 
		}; break;
		case 'playCardOnTile': 
		{
			let entity = evt.entity ? context.entities.getItemById('id', evt.entity) : context.entities.getItemById('playerid', evt.player);
			return describeEntity(entity)+' plays '+PCard(evt.card)+' on '+describeTile(evt.coords); 
		}; break;
		case 'changeStats': 
		{
			let ent = context.entities.getItemById('id', evt.entity);
			if (ent.type && (evt.stat in ent))
			{
				if ((evt.stat === 'Health') && (ent.Health == 0))
					return describeEntity(ent)+(evt.delta>0 ? ' gains ' : ' loses ')+Math.abs(evt.delta).toString()+' '+evt.stat+' and dies.';
				else
					return describeEntity(ent)+(evt.delta>0 ? ' gains ' : ' loses ')+Math.abs(evt.delta).toString()+' '+evt.stat+'.';
			}
			else
				return undefined;
		}; break;
		case 'bountyChanged': 
		{
			let ent = context.entities.getItemById('id', evt.entity);
			let desc = describeEntity(ent);
			switch (evt.value)
			{
				case 1: return 'There is a bounty on '+desc+"'s head!"; break;
				case 2: return desc+" has been declared a Fugitive!"; break;
				case 3: return desc+" has been declared a Traitor!"; break;
				default: return 'There is no longer a bounty on '+desc+"'s head."; break;
			}
		}; break;
		// Map tiles
		case 'putPeril': 
		{
			let ent = (evt.owner < 5) 
				? context.entities.getItemById('playerid', evt.owner)
				: context.entities.getItemById('id', evt.owner);
			return describeEntity(ent)+' puts '+PCard(evt.card)+' at '+describeTile(evt.coords)+'.'; 
		}; break;
		case 'encounterPeril':
		{
			let tile = context.map.getItemById('coords', evt.coords);
			let hero = context.entities.getItemById('id', evt.entity);
			return describeEntity(hero)+' encounters '+PCard(tile.perilcard)+' at '+describeTile(evt.coords)+'.';
		}; break;
		case 'completePeril':
		{
			let tile = context.map.getItemById('coords', evt.coords);
			let hero = context.entities.getItemById('id', evt.entity);
			let heroname = describeEntity(hero);
			let owner = context.entities.getItemById('id', tile.perilowner);
			let outcome = (evt.result == 'Win') ? ' has passed ' : ' has failed ';
			let dice = evt.dice.parts.map(function(p){return (p.value>0 ? '+' : '')+p.value.toString()}).join('').slice(1);
			let rolls = evt.dice.rolls;
			let text = heroname + outcome + describeEntity(owner) + "'s " + PCard(tile.perilcard)+' at '+describeTile(evt.coords)+'.';
			// generate tooltip describing the battle
			text += '<table class="roll-tooltip"><tr>';
			// combatant names
			text += '<td class="attacker-name">'+heroname+'</td>';
			text += '</tr><tr>'
			// dice counts
			text += '<td class="attacker">'+dice+'='+evt.dice.parts.reduce(function(a,b){return a+b.value;},0)+' dice</td>';
			text += '</tr><tr>'
			// dice hits
			text += '<td class="defender-dice">'+rolls.map(describeRoll).join('')+'</td>';
			text += '</tr></table>';
			return text;

		}; break;
		case "settlementChangeOwner":
		{
			// TRK33 == Emissary
			// TRK16 == Incite Revolt
			let entity; 
			if (evt.reason.slice(0,3) == 'TRK') 
				entity = evt.entity ? context.entities.getItemById('id', evt.entity) : context.entities.getItemById('playerid', evt.player);
			else 
				entity = context.entities.getLivingEntity('coords', evt.coords, false);
			switch (evt.reason)
			{
				case 'KingsDec': 
					return describeTile(evt.coords)+' has revolted.'; break;
				case 'BaneTerrorise':
				case 'KingsGuardTerrorise':
				case 'TRK16':
					return describeTile(evt.coords)+' has been terrorized by '+describeEntity(entity)+'.'; break;
				default:
					if (evt.type=='SettlementCaptured')
					{
						if (entity)
							return describeTile(evt.coords)+' has been captured by '+describeEntity(entity)+'.';
						else
							return describeTile(evt.coords)+' has been pacified.'; 
					}; break;
			}
		}; break;
		case "settlementFortified":
		{
			let tile = context.map.getItemById('coords', evt.coords);
			if (evt.entity)
			{
				let entity = context.entities.getItemById('id', evt.entity);
				return describeEntity(entity)+' has fortified '+describeTile(tile);
			}
			else
				return describeTile(tile)+' has been fortified.';
		}; break;
		// Other
		case 'completeQuest': return describeEntity(context.context.active)+' has completed a quest.'; break;
		case 'prestigeLeader': return describeEntity(context.players.getItemById('id', evt.player).hero)+' is now prestige leader!'; break;
		case 'declaration': return 'Declaration "'+PDecl(evt.type)+'" is now in effect!'; break;
		case 'playerQuit': 
		{
			let pl = context.players.getItemById('id', evt.player);
			let s = sanitize(pl.name);
			switch (evt.reason)
			{
				case 'PeerLeftRoom': s += ' has quit the game.'; break;
				case 'PeerKickedAFK': s += ' has been kicked for being AFK.'; break;
				default: s += ' disconnected.';
			}
			return s;
		}; break;
		case 'startTurn': 
		{
			let entity = evt.entity ? context.entities.getItemById('id', evt.entity) : context.entities.getItemById('playerid', evt.player);
			return "It's now "+describeEntity(entity)+"'s turn."; 
		}; break;
		case 'nextRound': return ((context.context.round % 2 == 0) ? 'Day ' : 'Night ')+(Math.floor(context.context.round / 2) + 1).toString(); break;
		case 'victory': return sanitize(context.players.getItemById('id', evt.player).name)+' wins the game!'; break;
		case 'chat': 
		{
			if (evt.message)
			{
				let s = evt.message.replace(/\[url="herotooltip:\/\/(\w+?)"\].+?\[\/url\]|\[.+?\]/ig, function (a,b) 
				{
					if (b)
						return describeEntity(context.entities.getItemById('type', b));
					else
						return '';
				});
				return describeEntity(context.players.getItemById('id', evt.player).hero)+' ['+evt.type+']: '+s; 
			}
			else if (evt.target)
				return describeEntity(context.players.getItemById('id', evt.player).hero)+': '+evt.type+' '+describeEntity(context.players.getItemById('id', evt.target).hero);
			else
				return describeEntity(context.players.getItemById('id', evt.player).hero)+': '+evt.type;
		}; break;
		default: return undefined; break;
	}
}

//these events will be paired, wrapping events that happen between them.
describeEvent.eventpairs = {
	attack : "combatEnd",
	encounterPeril : "completePeril",
	equipStarted : "equipEnded",
	playCardStarted : "playCardEnded",
};

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
		item.innerHTML = hero.equipment[i] ? PCard(hero.equipment[i]) : '-';
		let follower = cell.querySelector('.equipped .followers[data-index="'+i.toString()+'"]');
		follower.innerHTML = hero.followers[i] ? PCard(hero.followers[i]) : '-';
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
	let effects = eff.map(PCard).join('; ');
	let pacts = window.ArmelloMatchState.context.pacts.filter(function (p){return (p.initiator == id) || (p.recipient == id);});
	for (let i = pacts.length-1; i >= 0 ; i--)
	{
		let s = PCard(pacts[i].type);
		if (pacts[i].initiator == id)
			s += '(to ' + Name(window.ArmelloMatchState.players.getItemById('id',pacts[i].recipient).hero.type) + '); ';
		else
			s += '(from ' + Name(window.ArmelloMatchState.players.getItemById('id',pacts[i].initiator).hero.type) + '); ';
		effects = s + effects;
	}
	cell.querySelector('.effects').innerHTML = effects;
	cell.querySelector('.hand').innerHTML = player.hand.map(Name).join('; ');
	
	let caption = document.querySelector('#players .info[data-player-id="'+id+'"]');
	if (player.hasquit)
		caption.setAttribute('data-quit', 'true');
	else 
		caption.removeAttribute('data-quit');
	
	if (hero.SpiritStones >= 4)
		caption.setAttribute('data-spirit-walker', 'true');
	else
		caption.removeAttribute('data-spirit-walker');
	
	let king = window.ArmelloMatchState.entities.getItemById('type', 'King');
	if (hero.Rot > king.Rot)
		caption.setAttribute('data-rotten', 'true');
	else
		caption.removeAttribute('data-rotten');
	
	let bounty = hero.getBounty();
	if (bounty > 0)
		caption.setAttribute('data-bounty', bounty.toString());
	else
		caption.removeAttribute('data-bounty');
}

function ContextChanged(context, propname, action, value)
{
	if (propname == 'prestige_leader')
		for (let i = 0; i < window.ArmelloMatchState.players.items.length; i++)
		{
			let id = window.ArmelloMatchState.players.items[i].id;
			let caption = document.querySelector('#players .info[data-player-id="'+id+'"]');
			if (context.prestige_leader == id)
				caption.setAttribute('data-prestige-leader', 'true');
			else
				caption.removeAttribute('data-prestige-leader');
		}
	else if (propname == 'pacts')
		for (let i = 0; i < window.ArmelloMatchState.players.items.length; i++)
			updateHeroFor(window.ArmelloMatchState.players.items[i]);
}

function PlayersChanged(players, propname, propaction, player)
{
	if ((propaction === 'change') && (typeof player === 'undefined'))
	{
		for (let id = 1; id <= 4; id++)
		{
			let plr = players.getItemById('id',id);
			let caption = document.querySelector('#players .info[data-player-id="'+id+'"] a');
			caption.parentNode.setAttribute('data-clan', plr.hero.type.slice(0, -2))
			caption.innerHTML = '['+id.toString()+'] '+sanitize(plr.name);
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
function jumpToEvent(eventid, scrollto)
{	
	let target = document.querySelector('#turns *[data-event-index="'+eventid+'"]');
	if (!target) return false; // if event is not found, we do nothing
	if (!target.hasAttribute('selected')) // if event is already selected, we do nothing
	{
		// determine current selected event node and event index
		let current = document.querySelector('#turns *[selected]');
		// event index of the currently selected event
		let currenteventidx = current ? parseInt(current.getAttribute('data-event-index'), 10) : -1;
		// event index of the newly selected event
		let selectedeventidx = parseInt(eventid, 10);
		// look for the snapshot immediately preceding the newly selected event
		// determine snapshot index for the target event
		let snapshotidx = window.ArmelloMatchEvents[selectedeventidx].snapshot_index;
		// determine index of the event, after which the snapshot was done
		let starteventidx = selectedeventidx;
		while (window.ArmelloMatchEvents[starteventidx].snapshot_index == snapshotidx)
			starteventidx--;
		// if snapshot is ahead of the currently selected event, or 
		// if the newly selected event is behind the currently selected event
		if ((starteventidx > currenteventidx) || (selectedeventidx < currenteventidx))
			// then we should restore the snapshot first and go from there
			window.ArmelloMatchState.loadSnapshot(window.ArmelloMatchSnapshots[snapshotidx]);
		else // otherwise, both events are within the same snapshot chunk, and we can simply go forward.
			starteventidx = currenteventidx; // starting with the currently selected event
		// apply all events until we reach the one we are interested in.
		for (let i = starteventidx+1; i <= selectedeventidx; i++)
			window.ArmelloMatchState.processEvent(window.ArmelloMatchEvents[i]);
		// adjust the selected attribute
		if (current) current.removeAttribute('selected');
		target.setAttribute('selected','true');
		if (scrollto)
			target.scrollIntoView(true);
	}
	window.location.hash = target.getAttribute('data-event-index');
	return true;
}

function HashChanged(evt)
{
	// this event will be triggered by scripts changing hash as well
	// but as far as I understand, it's not a problem
	if (window.location.hash !== '') // if we got a link to a certain event, we select the corresponding line
	{
		evt.preventDefault();
		jumpToEvent(window.location.hash.slice(1), true);
	}
}

function EventClicked(evt)
{
	// determine which event has been selected
	let target = evt.target;
	while (!target.hasAttribute('data-event-index') && (target.id !== 'turns'))
		target = target.parentNode;
	// if click isn't on an event, or if the event is already selected, do nothing
	if ((target.id === 'turns') || target.hasAttribute('selected')) return;
	evt.preventDefault();
	jumpToEvent(target.getAttribute('data-event-index'), false);
}

function PrevEvent(evt)
{
	let current = document.querySelector('#turns *[selected]');
	if (current.previousElementSibling)
		jumpToEvent(current.previousElementSibling.getAttribute('data-event-index'), true);
}

function NextEvent()
{
	let current = document.querySelector('#turns *[selected]');
	if (current.nextElementSibling)
		jumpToEvent(current.nextElementSibling.getAttribute('data-event-index'), true);
}

function PrevTurn()
{
	let current = document.querySelector('#turns *[selected]');
	let matcher = /\bevent-startTurn\b/i;
	let target = current.previousElementSibling;
	while (target && !matcher.test(target.className))
		target = target.previousElementSibling;
	if (target)
		jumpToEvent(target.getAttribute('data-event-index'), true);
}

function NextTurn()
{
	let current = document.querySelector('#turns *[selected]');
	let matcher = /\bevent-startTurn\b/i;
	let target = current.nextElementSibling;
	while (target && !matcher.test(target.className))
		target = target.nextElementSibling;
	if (target)
		jumpToEvent(target.getAttribute('data-event-index'), true);
}

function FirstEvent()
{
	let turns = document.querySelector('#turns');
	jumpToEvent(turns.firstElementChild.getAttribute('data-event-index'), true);
}

function LastEvent()
{
	let turns = document.querySelector('#turns');
	jumpToEvent(turns.lastElementChild.getAttribute('data-event-index'), true);
}
//================================================================================================
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
	if (entity = getItemAt(window.ArmelloMatchState.entities, x, y, 0.5, function(ent){return !ent.dead;}))
	{
		if (entity.item instanceof Hero)
			tooltip.innerHTML = Name(entity.item.type)+'<br />'+sanitize(window.ArmelloMatchState.players.getItemById('id',entity.item.playerid).name)+'<br /><span class="stat">H</span>'+entity.item.Health.toString()+'<span class="stat">F</span>'+entity.item.Fight.toString();
		else if (entity.item instanceof Illusion)
			tooltip.innerHTML = Name(entity.item.type)+' of '+Name(entity.item.original)+'<br />';
		else if (entity.item.type === 'King')
			tooltip.innerHTML = Name(entity.item.type)+'<br /><span class="stat">H</span>'+entity.item.Health.toString()+'<span class="stat">R</span>'+entity.item.Rot.toString();
		else if (entity.item.type === 'KingsGuard')
			tooltip.innerHTML = Name(entity.item.type)+'<br /><span class="stat">H</span>'+entity.item.Health.toString()+'<span class="stat">F</span>'+entity.item.Fight.toString();
		else if (entity.item.type === 'Bane')
			tooltip.innerHTML = Name(entity.item.type)+'<br /><span class="stat">H</span>'+entity.item.Health.toString()+'<span class="stat">F</span>'+entity.item.Fight.toString()+'<span class="stat">R</span>'+entity.item.Rot.toString();
		else
			tooltip.innerHTML = Name(entity.item.type);
		tooltip.style = 'visibility:visible; right:'+rx.toString()+'px; bottom:'+by.toString()+'px';
	}
	else if (marker = getItemAt(window.ArmelloMatchState.markers, x, y, 0.7))
	{
		tooltip.innerHTML = marker.item.title;
		tooltip.style = 'visibility:visible; right:'+rx.toString()+'px; bottom:'+by.toString()+'px';
	}
	else if (tile = getItemAt(window.ArmelloMatchState.map, x, y, 1.0))
	{
		let text = describeTile(tile.item);
		switch (tile.item.type)
		{
			case 'ClanCastle': 
			{
				let plr = window.ArmelloMatchState.players.getItemById('corner', tile.item.corner, false);
				if (plr) text += '<br />' + sanitize(plr.name); break;
			}
			case 'Settlement':
			{
				if (tile.item.state.fortified)
					text += '<br />Fortified';
				if (tile.item.state.terrorized)
					text += '<br />Terrorized';
				else if (tile.item.state.owner)
				{
					let owner = window.ArmelloMatchState.entities.getItemById('id', tile.item.state.owner, false);
					if (owner)
						text += '<br />Owner: '+Name(owner.type);
				}
			}; break;
		}
		for (let i = 0; i < tile.item.effects.length; i++)
			text += '<br />'+Name(tile.item.effects[i]);
		if (tile.item.perilcard)
		{
			let ent = (tile.item.perilowner < 5) 
				? window.ArmelloMatchState.players.getItemById('id', tile.item.perilowner).hero 
				: window.ArmelloMatchState.entities.getItemById('id', tile.item.perilowner);
			text += '<br /><span class="stat">#</span> ' + Name(tile.item.perilcard) + '(' + Name(ent.type) + ')';
			if (tile.item.perilbuffs.length > 0)
				text += '<br />' + tile.item.perilbuffs.map(Name).join(', ');
		}
		tooltip.innerHTML = text;
		tooltip.style = 'visibility:visible; right:'+rx.toString()+'px; bottom:'+by.toString()+'px';
	}
	else
	{
		tooltip.innerHTML = '';
		tooltip.style = '';
	}
}

function MapLeave(evt)
{
	let tooltip = document.getElementById('maptooltip');
	tooltip.innerHTML = '';
	tooltip.style = '';
}
//================================================================================================
function KeyUp(evt)
{
	switch (evt.key)
	{
		case 'Up':
		case 'ArrowUp':
		{
			evt.preventDefault();
			PrevEvent();
		}; break;
		case 'Down':
		case 'ArrowDown':
		{
			evt.preventDefault();
			NextEvent();
		}; break;
		case 'PageUp':
		{
			evt.preventDefault();
			PrevTurn();
		}; break;
		case 'PageDown':
		{
			evt.preventDefault();
			NextTurn();
		}; break;
		case 'Home':
		{
			evt.preventDefault();
			FirstEvent();
		}; break;
		case 'End':
		{
			evt.preventDefault();
			LastEvent();
		}; break;
	}
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
	// event handlers for canvas tooltip
	canvas.addEventListener('mousemove', MapHover, false);
	canvas.addEventListener('mouseleave', MapLeave, false);
	// subscribing to match state changes, so we can update the on-screen info
	window.ArmelloMatchState.players.subscribe(PlayersChanged);
	window.ArmelloMatchState.context.subscribe(ContextChanged);
	window.ArmelloMatchState.subscribe(OnUpdate);
	// event handlers for highlighting entities and tiles in the events log.
	let turns = document.getElementById('turns');
	turns.addEventListener('click', EventClicked, false);
	turns.addEventListener('mouseover', EventHover, false);
	// respond to location hash being changed
	window.addEventListener('hashchange', HashChanged, false);
	// respond to keypresses
	window.addEventListener('keyup', KeyUp, false);
}
//================================================================================================
window.addEventListener('load', function(evt) {
	window.ArmelloMatchState = new MatchState(); // this object holds match state
	if (('ArmelloMatchEvents' in window) && ('ArmelloMatchSnapshots' in window))
	{
		// we detect match data already present - the page must've been saved in match view mode
		switchToMainView();
		// let's determine which point of the timeline we should jump to
		let eventchosen = false;
		if (window.location.hash !== '') // if we got a link to a certain event, we go to the corresponding point
			eventchosen = jumpToEvent(window.location.hash.slice(1), true);
		if (!eventchosen) // we haven't got a link, or it's wrong - jump to selected event
		{
			let current = document.querySelector('#turns *[selected]');
			if (current && current.getAttribute('data-event-index'))
			{
				current.removeAttribute('selected'); // have to do that to ensure jump
				eventchosen = jumpToEvent(current.getAttribute('data-event-index'), true);
			}
		}
		// we got wrong link or otherwise failed to find desired event - just load the first event
		if (!eventchosen)
		{
			let first = document.querySelector('#turns *[data-event-index]')
			jumpToEvent(first.getAttribute('data-event-index'), true);
		}
	}
	else // we detect no match data or it's incomplete - we configure loader form instead
	{
		if (window.location.hash) 
			window.location.hash = '';
		// initialize file uploader
		var fproc = new FileProcessor(document.getElementById('dropzone'), LogFileSelected, '#888888', 'transparent');
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
			case 'windows': logpath.innerHTML = '%APPDATA%\\..\\LocalLow\\League of Geeks\\Armello\\logs\\'; break;
			case 'linux': logpath.innerHTML = '~/.config/unity3d/League of Geeks/Armello/logs/'; break;
			case 'mac': logpath.innerHTML = '~/Library/Application Support/League of Geeks/Armello/logs/'; break;
		}
	}
}, false);
