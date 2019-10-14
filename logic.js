//==================================================================================================
// This class describes current state of affairs in the game.
function MatchState()
{
	Observable.call(this);
	this.context = new MatchContext();
	this.context.subscribe(Observable.prototype.notify.bind(this, 'context', 'change'));
	this.map = new LevelMap();
	this.map.subscribe(Observable.prototype.notify.bind(this, 'map', 'change'));
	this.entities = new EntityCollection();
	this.entities.subscribe(Observable.prototype.notify.bind(this, 'entities', 'change'));
	this.markers = new MarkerCollection();
	this.markers.subscribe(Observable.prototype.notify.bind(this, 'markers', 'change'));
	this.players = new PlayerCollection();
	this.players.subscribe(Observable.prototype.notify.bind(this, 'players', 'change'));
}

MatchState.prototype = Object.create(Observable.prototype);
MatchState.prototype.constructor = MatchState;

MatchState.prototype.traders = ['TRK38','TRK39','TRK44','TRK45'];
MatchState.prototype.traders_pre = ['TRK38PRE','TRK39PRE','TRK44PRE','TRK45PRE'];
MatchState.prototype.assaultcards = [
	'MAG04', 'MAG05', 'MAG07', 'MAG11', 'MAG12', 'MAG25', 'MAG34',
	'TRK08',
	'CON04', 'CON07', 'CON10', 'CON11', 
	];

MatchState.prototype.loadSnapshot = function (data)
{
	this.context.deserialize(data.context);
	this.map.deserializeItems(data.map);
	this.entities.deserializeItems(data.entities);
	this.markers.deserializeItems(data.markers);
	this.players.deserializeItems(data.players, this.entities);
};
MatchState.prototype.getSnapshot = function ()
{
	return {
		context: this.context.serialize(),
		map: this.map.serializeItems(),
		entities: this.entities.serializeItems(),
		markers: this.markers.serializeItems(),
		players: this.players.serializeItems(),
	};
};

MatchState.prototype.startBounty = function (hero)
{
	if (!hero.hasBounty())
	{
		if (this.context.declaration === '0xC121AADB') //King's bounties
			return hero.setBounty(2);
		else
			return hero.setBounty(1);
	}
};

//this object serves as a namespace for event handlers
MatchState.prototype.event_handlers = {
	// ======================================= Entities =======================================
	spawnNPC : function (evt) { this.entities.addNewItem(Entity, evt.entity, evt.type, evt.coords); },
	spawnIllusion: function (evt)
	{
		let player = this.players.getItemById('id', evt.player);
		this.entities.addNewItem(Illusion, evt.entity, evt.coords, evt.player, player.hero.type); 
	},
	spawnHero: function (evt)
	{
		let hero = new Hero(evt.entity);
		this.entities.addItem(hero);
		let player = this.players.getItemById('id',evt.player);
		let corner;
		switch (evt.coords)
		{
			case '0,0':  corner = 'Northeast';break;
			case '7,0':  corner = 'Northwest';break;
			case '3,8':  corner = 'Southwest';break;
			case '-4,8': corner = 'Southeast';break;
			default: if (evt.corner) corner = evt.corner; break;
		}
		player.setHero(hero, corner);
		let tile = this.map.getItemById('coords', evt.coords);
		tile.state.player = evt.player;
	},
	setupHero: function (evt)
	{
		let hero = this.entities.getItemById('id', evt.entity);
		hero.setType(evt.type);
		hero.moveTo(evt.coords);
	},
	moveEntity: function (evt) 
	{ 
		let entity = this.entities.getItemById('id', evt.entity);
		entity.moveTo(evt.coords); 
		if (entity instanceof Hero)
		{
			let tile = this.map.getItemById('coords', evt.coords);
			if (tile.type === 'KingsPalace')
				return this.startBounty(entity);
			else if (this.context.declaration == '0xC121AA7A' && (tile.type === 'Dungeon' || tile.type === 'StoneCircle'))
				return this.startBounty(entity);
		}
	},
	attack : function (evt)
	{
		let attacker = this.entities.getItemById('id', evt.attacker);
		let defender = this.entities.getItemById('id', evt.defender);
		if ( (attacker instanceof Hero) //it's a hero
			 && (defender instanceof Hero) //attacking another Hero
			 && (attacker.equipment.indexOf('ITM08') < 0) //without Royal Pardon
			 && this.context.pacts.some(function(p){ //and they had Armistice going
				return (p.type === 'TRK34') && //Armistice
					( (p.initiator==attacker.playerid && p.recipient==defender.playerid) || 
					  (p.initiator==defender.playerid && p.recipient==attacker.playerid) );
				}) )
		{
			return attacker.setBounty(3);
		}
	},
	combatEnd : function (evt)
	{
		let attacker = this.entities.getItemById('id', evt.attacker);
		let defender = this.entities.getItemById('id', evt.defender);
		//attacker bounty needs to be calculated if...
		if ( (attacker instanceof Hero) //it's a hero
			 && (attacker.equipment.indexOf('ITM08') < 0) //without Royal Pardon
			 && (evt.outcome != 'Attacking-Defeat') //and survives
			 && (evt.outcome != 'Attacking-BothDead')
			)
		{
			//hero attacks a guard while not having any bounty
			if (defender.type === "KingsGuard" && !attacker.hasBounty()) 
				return this.startBounty(attacker);
			//failed attack on the King, but hero survived
			else if (defender.type === "King" && (evt.outcome == 'Attacking-Lose'))
				return attacker.setBounty(3);
		}
	},
	killEntity: function (evt)
	{
		let ent = this.entities.getItemById('id', evt.entity); 
		if (ent instanceof Hero)
		{
			this.context.clearPactsFor(ent.playerid);
			return ent.setBounty(0);
		}
		else
			// apparently entities can receive updates even after they has been killed...
			// so we just mark them as dead.
			ent.kill();
	},
	applyKingsDecToGuard: function (evt)
	{
		if (this.context.declaration == '0xC121AABB') //Desertion
			this.entities.getItemById('id', evt.entity).kill();
	},
	addEffect: function (evt) { this.entities.getItemById('id', evt.entity).addEffect(evt.card); }, 
	removeEffect: function (evt) { this.entities.getItemById('id', evt.entity).removeEffect(evt.card); },
	equipCard: function (evt) 
	{ 
		let entity = this.entities.getItemById('id', evt.entity);
		entity.equipCard(parseInt(evt.slot), evt.card); 
		if ( (entity instanceof Hero) && (evt.card === 'ITM08') ) //Royal Pardon
			return entity.setBounty(0);
	}, 
	unequipCard: function (evt) { this.entities.getItemById('id', evt.entity).unequipCard(evt.slot, evt.card); },
	gainCard: function (evt) { this.players.getItemById('id', evt.player).gainCard(evt.card); },
	loseCard: function (evt) { this.players.getItemById('id', evt.player).loseCard(evt.card); },
	changeStats: function (evt)
	{
		let ent = this.entities.getItemById('id', evt.entity);
		let before = ent[evt.stat];
		ent.changeStat(evt.stat, evt.value);
		let after = ent[evt.stat];
		// As of 1.10 there are no more "hero corrupted" log events. We do it manually.
		if ((evt.stat == 'Rot') && (ent instanceof Hero) && ((before < 5) != (after < 5)))
			ent.toggleCorrupted();
	},
	gainPact: function (evt)
	{
		let p1 = evt.player;
		let p2 = this.entities.getItemById('id', evt.entity).playerid;
		this.context.addPact(evt.card, p1, p2); 
	},
	losePact: function(evt) { this.context.breakPactBetween(evt.card, evt.player1, evt.player2); },
	playCardOnCreature: function (evt)
	{
		let hero = this.entities.getItemById('playerid', evt.player);
		let entity = this.entities.getItemById('id', evt.entity);
		if (evt.card === 'TRK18' && (entity instanceof Hero)) // Bounty
		{
			let level = entity.getBounty();
			if (level > 0 && level < 3)
				return entity.setBounty(level+1);
			else if (level == 0)
				return this.startBounty(entity);
		}
		else if (evt.card === 'TRK09') //Reprieve
			return entity.setBounty(0);
		else if (entity.type === 'KingsGuard' && this.assaultcards.indexOf(evt.card) >= 0)
			return this.startBounty(hero);
	},
	// ======================================= Tiles =======================================
	addTile: function(evt)
	{
		if (!this.map.getItemById('coords', evt.coords, false))
			this.map.addNewItem(MapTile, evt.type, evt.coords, evt.corner); 
	},
	addTileEffect: function(evt)
	{
		if (evt.card != 'None')
			this.map.getItemById('coords', evt.coords).addEffect(evt.card);
	},
	playCardOnTile: function(evt)
	{
		let tile = this.map.getItemById('coords', evt.coords);
		switch (evt.card+'>'+tile.type)
		{
			case 'MAG36>Swamp': tile.changeType('Forest'); break; //Spirit Seeds
			case 'TRK43>Forest': tile.changeType('Swamp'); break; //Arson
			case 'TRK46>Settlement': tile.addEffect('TRK46'); break; //Palisade Walls
			default:
			{
				let trdid = this.traders.indexOf(evt.card);
				if ((trdid >= 0) && (tile.type == 'Settlement'))
				{
					tile.removeEffect.apply(tile, this.traders);
					tile.removeEffect.apply(tile, this.traders_pre);
					tile.addEffect(this.traders_pre[trdid]);
				}
			}
		}
	},
	// ======================================= Perils =======================================
	putPeril: function (evt)
	{
		let id = (evt.owner < 5) ? this.players.getItemById('id', evt.owner).hero.id : evt.owner;
		this.map.getItemById('coords', evt.coords).setPeril(evt.peril, evt.card, id); 
	},
	buffPeril: function (evt) { this.map.getItemById('peril', evt.peril).buffPeril(evt.card); },
	clearPeril: function (evt) { this.map.getItemById('peril', evt.peril).clearPeril(); },
	// ======================================= Settlements =======================================
	settlementChangeOwner: function(evt)
	{
		let tile = this.map.getItemById('coords', evt.coords);
		// TRK33 == Emissary
		let entityid;
		if ((evt.reason === 'Entity') || (evt.reason === 'BaneTerrorise' ) || (evt.reason === 'KingsGuardTerrorise') || (evt.reason === 'HeroClaim')) 
		{
			let entity = this.entities.getLivingEntity('coords', evt.coords, false);
			entityid = entity ? entity.id : undefined;
		}
		else if (evt.entity)
			entityid = evt.entity;
		else if (evt.player)
			entityid = this.players.getItemById('id',evt.player).heroid;
		// TRK16 == Incite Revolt
		if ((evt.type == 'SettlementTerrorised') || (evt.reason == 'TerroriseSettlement' ) || (evt.reason == 'BaneTerrorise' ) || (evt.reason == 'KingsDec' ) || (evt.reason == 'KingsGuardTerrorise') || (evt.reason == 'TRK16'))
		{
			tile.terrorizeSettlement();
			// -Patronage & Industry
			// -Palisade Walls
			// -Roxy's Recruiting
			// -Biff's Black Market
			// -Stone Wards
			tile.removeEffects('TRK13', 'TRK37', 'TRK44', 'TRK45', 'TRK44PRE', 'TRK45PRE', 'TRK46');
		}
		else
			tile.captureSettlement(entityid);
	},
	settlementFortified: function(evt) { this.map.getItemById('coords', evt.coords).fortifySettlement(); },
	// ======================================= Markers =======================================
	predictBane: function (evt)
	{
		if (evt.active == 'True')
			this.markers.addNewItem(MapMarker, 'banespawn', evt.coords, 'Incoming Bane');
		else
			this.markers.removeItemById('coords', evt.coords);
	},
	predictSpiritStone: function (evt)
	{
		if (evt.active == 'True')
			this.markers.addNewItem(MapMarker, 'stonespawn', evt.coords, 'Incoming Spirit Stone');
		else
			this.markers.removeItemById('coords', evt.coords);
	},
	spawnSpiritStone: function (evt) 
	{
		let entity = this.entities.getItemById('coords', evt.coords, false);
		if (!entity)
			this.markers.addNewItem(MapMarker, 'stone', evt.coords, 'Spirit Stone'); 
	},
	removeSpiritStone: function (evt)
	{
		for (let i = 0; i < this.markers.items.length; i++)
			if ((this.markers.items[i].type == 'stone') && (this.markers.items[i].coords == evt.coords))
			{
				this.markers.removeItem(this.markers.items[i]);
				break;
			}
	},
	setQuest: function (evt)
	{
		let player = this.players.getItemById('id', evt.player);
		let quest = this.markers.getItemById('player', evt.player, false);
		if (quest)
			this.markers.removeItem(quest);
		else
			player.nextQuest();
		this.markers.addNewItem(MapMarker, 'quest', evt.coords, Name(player.hero.type)+" quest #"+player.quests, evt.player);
	},
	completeQuest: function (evt)
	{
		let hero = this.entities.getItemById('id', this.context.active);
		if (!(hero instanceof Hero)) return;
		let quest = this.markers.getItemById('player', hero.playerid, false);
		if (quest && (hero.coords == quest.coords)) // a story quest
			this.markers.removeItem(quest);
	},
	// ======================================= Other =======================================
	prestigeLeader: function (evt) { this.context.setPrestigeLeader(evt.player); },
	declaration: function (evt) 
	{ 
		this.context.setDeclaration(evt.type); 
		switch (this.context.declaration) 
		{
			case '0xC121AA7A': // For Royal Eyes Only
			{
				let bounties = [];
				for (let p = 0; p < 4; p++)
				{
					let bounty;
					let hero = this.players.items[p].hero;
					let tile = this.map.getItemById('coords', hero.coords)
					if (tile.type == 'Dungeon' || tile.type == 'StoneCircle')
						bounty = this.startBounty(hero);
					if (bounty)
						bounties.push(bounty);
				};
				return bounties;
			}; break;
			case '0xC121AAD7': //Royal Challenge
			case '0xC121AAB4': //Palace Lockdown
			{
				let hero = this.entities.getItemById('playerid', this.context.prestige_leader);
				return this.startBounty(hero);
			}; break;
			case "0xC121AAB5" : //War March
			case "War Drums" : //War Drums
			{
				let bounties = [];
				for (let p = 0; p < 4; p++)
				{
					let hero = this.players.items[p].hero;
					let bounty = this.startBounty(hero);
					if (bounty)
						bounties.push(bounty);
				}
				return bounties;
			}; break;
		}
	}, 
	playerStart: function (evt)
	{
		if (typeof this.players.getItemById('id', evt.player, false) === 'undefined')
			this.players.addNewItem(Player, evt.player, evt.alias, evt.loc, evt.steam); 
	},
	playerQuit: function (evt) { this.players.getItemById('id', evt.player).quit(); },
	startTurn: function (evt)
	{
		let entity = evt.entity ? evt.entity : this.entities.getItemById('playerid', evt.player).id;
		this.context.setTurn(entity); 
	}, 
	endTurn: function (evt) { this.context.setTurn(undefined); },
	nextRound: function (evt)
	{
		let events = undefined;
		this.context.nextRound();
		if (this.context.isDay()) //morning - increase bounty levels
		{
			events = [];
			for (let p = 0; p < 4; p++)
			{
				let bounty = this.players.items[p].hero.updateBounty();
				if (bounty)
					events.push(bounty);
			}
			for (let i = 0; i < this.map.items.length; i++)
			{
				let item = this.map.items[i];
				item.removeEffects('MAG30', 'MAG46'); //Wall of Thorns, Rotten Fog
			}
		}
		for (let i = 0; i < this.map.items.length; i++)
		{
			let item = this.map.items[i];
			if (item.type == 'Settlement')
			{
				item.removeEffects.apply(item, this.traders);
				for (let j = 0; j < this.traders_pre.length; j++)
					if (item.hasEffect(this.traders_pre[j]))
					{
						item.removeEffect(this.traders_pre[j]);
						item.addEffect(this.traders[j]);
					}
			}
		}
		return events;
	},
};

// Main event processing routine
MatchState.prototype.processEvent = function (evt)
{
	try
	{
		let handler = this.event_handlers[evt.name];
		if (handler)
			return handler.call(this, evt);
	}
	catch (err)
	{
		console.error("Error when processing event: ", evt);
		throw err;
	}
};