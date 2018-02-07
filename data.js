'use strict';
//==================================================================================================
// Basic class implementing Observer pattern
function Observable()
{
	// list of observers
	Object.defineProperty( this, '_observers', {
		value : new Array(),
		enumerable : false, // property is not enumerable, so it won't appear in JSON
		writable : false, // can't be replaced with another object, but array can still be changed
		configurable : false, // can't be deleted
	});
}
Observable.prototype = {
	constructor : Observable,
	subscribe : function (handler)
	{
		this._observers.push(handler);
	},
	unsubscribe : function (handler)
	{
		var index = this._observers.indexOf(handler);
		if (index >= 0)
			this._observers.splice(index, 1);
	},
	notify : function (property, action, value)
	{
		let args = Array.prototype.slice.call(arguments);
		args.unshift(this);
		for (var i=0; i<this._observers.length; i++)
			try
			{ this._observers[i].apply(null, args); }
			catch (e)
			{ console.error(e); }
	},
};
//==================================================================================================
// Observable collection that can save and restore its elements.
// If elements are inherited from Observable, collection will subscribe to them and translate their notifications.
function SerializableObservableCollection()
{
	Observable.call(this);
	this.items = [];
	// this function is used to subscribe to Observable items
	Object.defineProperty( this, '_itemchanged', {
		value : Observable.prototype.notify.bind(this, 'items', 'change'),
		enumerable : false, // property is not enumerable, so it won't appear in JSON
		writable : false, // can't be replaced with another object
		configurable : false, // can't be deleted
	});
};
SerializableObservableCollection.prototype = Object.create(Observable.prototype);
SerializableObservableCollection.prototype.constructor = SerializableObservableCollection;
SerializableObservableCollection.prototype.addItem = function (item)
{
	if (item instanceof Observable)
		item.subscribe(this._itemchanged);
	this.items.push(item);
	this.notify('items','add',item);
};
// A shorthand method to create new items.
// addNewItem(Cls, a, b, c) is the same as addItem(new Cls(a, b, c))
SerializableObservableCollection.prototype.addNewItem = function (Class/*,...*/)
{
	var item = new (Function.prototype.bind.apply(Class, arguments));
	this.addItem(item);
};
SerializableObservableCollection.prototype.clearItems = function ()
{
	for (var i = 0; i < this.items.length; i++) 
		if (item instanceof Observable)
			this.items[i].unsubscribe(handler);
	this.items.splice(0, this.items.length);
	this.notify('items', 'change');
};
SerializableObservableCollection.prototype.removeItem = function (item)
{
	var index = this.items.indexOf(item);
	if (index < 0)
		throw new Error(this.constructor.name+": Item "+item.toString()+" does not exist in collection "+this.toString());
	else
	{
		if (item instanceof Observable)
			item.unsubscribe(this._itemchanged);
		this.items.splice(index, 1);
		this.notify('items','remove',item);
	}
};
// Allows to remove items by property value
SerializableObservableCollection.prototype.removeItemById = function (key, value, strict)
{
	for (var i = 0; i < this.items.length; i++)
		if (this.items[i][key] == value)
		{
			let item = this.items[i];
			if (item instanceof Observable)
				item.unsubscribe(this._itemchanged);
			this.items.splice(i, 1);
			this.notify('items','remove',item);
			return;
		}
	if ((typeof strict === 'undefined') || strict)
		throw new Error(this.constructor.name+": There is no item with "+key.toString()+" = "+value.toString());
};
// Allows to find items by property value
SerializableObservableCollection.prototype.getItemById = function (key, value, strict)
{
	for (var i = 0; i < this.items.length; i++)
		if (this.items[i].hasOwnProperty(key) && (this.items[i][key] == value))
			return this.items[i];
	if ((typeof strict === 'undefined') || strict)
		throw new Error(this.constructor.name+": There is no item with "+key.toString()+" = "+value);
};
SerializableObservableCollection.prototype.serializeItems = function()
{
	return JSON.stringify(this.items);
};
// restores the state of collection. reviver function is used to turn basic JS objects into instances of specific class
SerializableObservableCollection.prototype.deserializeItems = function(data, reviver)
{
	var objectlist = JSON.parse(data);
	if (!Array.isArray(objectlist))
		throw new Error("Invalid data - not an array");
	for (var i = 0; i < this.items.length; i++) 
		if (this.items[i] instanceof Observable)
			this.items[i].unsubscribe(this._itemchanged);
	this.items.splice(0, this.items.length);
	for (var i = 0; i < objectlist.length; i++)
		if (typeof reviver === 'function')
		{
			var newitem = reviver(objectlist[i]);
			if (newitem instanceof Observable)
				newitem.subscribe(this._itemchanged);			
			this.items.push(newitem);
		}
		else
			this.items.push(objectlist[i]);
	this.notify('items', 'change');
};
// provides reviver function that will construct an instance of a class (with given parameters),
// and then will copy values for all visible properties of that instance from the source object
SerializableObservableCollection.getSimpleReviver = function (Class/*,...*/)
{
	return function(obj)
	{
		var newitem = new (Function.prototype.bind.apply(Class, arguments));
		var keys = Object.keys(newitem);
		for (var k = 0; k < keys.length; k++)
			if (newitem.hasOwnProperty(keys[k]))
				newitem[keys[k]] = obj[keys[k]];
		return newitem;
	};
}
//==================================================================================================
function Entity(id, type, coords)
{
	Observable.call(this);
	this.id = id;
	this.type = type;
	this.dead = false;
	this.corrupted = false;
	if (typeof coords !== 'undefined')
		this.coords = coords;
	else	
		this.coords = "-1,-1";
	Object.defineProperty( this, 'u', {
		get : function() {return Number.parseInt(this.coords.split(',')[0]);},
		enumerable : false,
		configurable : false,
	});
	Object.defineProperty( this, 'v', {
		get : function() {return Number.parseInt(this.coords.split(',')[1]);},
		enumerable : false,
		configurable : false,
	});
	
	this.Fight = 0;
	this.Body = 0;
	this.Rot = 0;
	this.Health = 0;
	this.ActionPoints = 0;
	
	this.effects = new Array();
	this.equipment = new Array();
}
Entity.prototype = Object.create(Observable.prototype);
Entity.prototype.constructor = Entity;
Entity.prototype.moveTo = function (coords)
{
	this.coords = coords;
	this.notify('coords', 'change', this.coords);
};
Entity.prototype.setType = function (type)
{
	this.type = type;
	this.notify('type', 'change', type);
};
Entity.prototype.kill = function()
{
	this.dead = true;
	this.notify('dead', 'change', this.dead);
};
Entity.prototype.changeStat = function (stat, newvalue)
{
	if (this.hasOwnProperty(stat) && (this[stat] !== newvalue))
	{
		this[stat] = parseInt(newvalue, 10);
		this.notify(stat, 'change', this[stat]);
	}
};
Entity.prototype.equipCard = function (slot, card)
{
	this.equipment[slot] = card;
	this.notify('equipment', 'add', card);
};
Entity.prototype.unequipCard = function (slot, card)
{
	if (this.equipment[slot] == card)
	{
		this.equipment[slot] = undefined;
		this.notify('equipment', 'remove', card);
	}
	else
		console.warn('Entity '+this.type+'('+this.id+') lost equipped card '+card+' in slot '+slot+' despite having '+this.equipment[slot]+' there.');
};
Entity.prototype.addEffect = function (effect)
{
	this.effects.push(effect);
	this.notify('effects', 'add', effect);
};
Entity.prototype.removeEffect = function (effect)
{
	var index = this.effects.indexOf(effect);
	if (index >= 0)
	{
		this.effects.splice(index, 1);
		this.notify('effects', 'remove', effect);
	}
	else
		console.warn('Entity ',this.type,'(',this.id,') lost effect ',effect,' despite never having gained it.');
};
Entity.prototype.toggleCorrupted = function ()
{
	this.corrupted = !this.corrupted;
	this.notify('corrupted', 'change', this.corrupted);
};
//==================================================================================================
function Hero(id, corner)
{
	Entity.call(this, id);
	this.Wits = 0;
	this.Gold = 0;
	this.Spirit = 0;
	this.Magic = 0;
	this.Prestige = 0;
	this.SpiritStones = 0;
	
	this.followers = new Array();
	this.bounty = 0;
	this.playerid = undefined;
}
Hero.prototype = Object.create(Entity.prototype);
Hero.prototype.constructor = Hero;
Hero.prototype.equipCard = function (slot, card)
{
	if (card.slice(0,3) == 'FOL')
	{
		this.followers[slot] = card;
		this.notify('followers', 'add', card);
	}
	else
		Entity.prototype.equipCard.apply(this, arguments);
};
Hero.prototype.unequipCard = function (slot, card)
{
	if (card.slice(0,3) == 'FOL')
	{
		if (typeof this.followers[slot] !== 'undefined')
		{
			this.followers[slot] = undefined;
			this.notify('followers', 'remove', card);
		}
		else
			console.warn('Hero ',this.type,'(',this.id,') lost follower ',card,' in slot ',slot,' despite having nothing there.');
	}
	else
		Entity.prototype.unequipCard.apply(this, arguments);
};
Hero.prototype.updateBounty = function()
{
	if ((this.bounty > 0) && (this.bounty < 3))
	{
		this.bounty++;
		this.notify('bounty', 'change', this.bounty);
	}
};
Hero.prototype.toggleBounty = function()
{
	this.bounty = (this.bounty == 0) ? 1 : 0;
	this.notify('bounty', 'change', this.bounty);
};
//==================================================================================================
function Player(id, name, location, steam)
{
	Observable.call(this);
	this.id = id;
	this.location = location;
	this.hasquit = false;
	this.name = name;
	this.steam = steam;
	this.hand = new Array();
	this.heroid = undefined;
	Object.defineProperty( this, 'hero', {
		value : undefined,
		enumerable : false, // property is not enumerable, so it won't appear in JSON
		writable : true, // can be replaced with another object
		configurable : false, // can't be deleted
	});
	this.corner = undefined;
	this.quests = 0;
	Object.defineProperty( this, '_herochanged', {
		value : Observable.prototype.notify.bind(this, 'hero', 'change'),
		enumerable : false, // property is not enumerable, so it won't appear in JSON
		writable : false, // can't be replaced with another object
		configurable : false, // can't be deleted
	});
}
Player.prototype = Object.create(Observable.prototype);
Player.prototype.constructor = Player;
Player.prototype.setHero = function (hero, corner)
{
	this.heroid = hero.id;
	this.hero = hero;
	this.hero.playerid = this.id;
	this.hero.subscribe(this._herochanged);
	this.notify('hero', 'set', hero);
	if (corner)
	{
		this.corner = corner;		
		this.notify('corner', 'set', corner);
	}
};
Player.prototype.gainCard = function (card)
{
	this.hand.push(card);
	this.notify('hand', 'add', card);
};
Player.prototype.loseCard = function (card)
{
	var index = this.hand.indexOf(card);
	if (index >= 0)
	{
		this.hand.splice(index, 1);
		this.notify('hand', 'remove', card);
	}
	else
		console.warn('Player ',this.name,' lost a card ',card,' from their hand they never had.');
};
Player.prototype.nextQuest = function ()
{
	this.quests++;
	this.notify('quests', 'change', this.quests);
};
Player.prototype.quit = function ()
{
	this.hasquit = true;
	this.notify('hasquit', 'change', this.hasquit);
};
//==================================================================================================
function MapTile(type, coords, corner)
{
	Observable.call(this);
	if (typeof coords !== 'undefined')
		this.coords = coords;
	else	
		this.coords = "-1,-1";
	Object.defineProperty( this, 'u', {
		get : function() {return Number.parseInt(this.coords.split(',')[0]);},
		enumerable : false,
		configurable : false,
	});
	Object.defineProperty( this, 'v', {
		get : function() {return Number.parseInt(this.coords.split(',')[1]);},
		enumerable : false,
		configurable : false,
	});
	this.type = type;
	this.peril = undefined;
	this.perilcard = undefined;
	this.perilowner = undefined;
	this.perilbuffs = new Array();
	this.corner = corner;
}
MapTile.prototype = Object.create(Observable.prototype);
MapTile.prototype.constructor = MapTile;
MapTile.prototype.changeType = function (newtype)
{
	this.type = newtype;
	this.notify('type', 'change', this.type);
};
MapTile.prototype.setPeril = function (peril, card, owner)
{
	if (typeof this.peril === 'undefined')
	{
		this.peril = peril;
		this.perilcard = card;
		this.perilowner = owner;
		this.perilbuffs = [];
		this.notify('peril', 'change', this.peril);
	}
	else
		console.warn('Entity ',owner,' tried to set a peril (',peril,') to a tile (',this.coords,') that already had a peril (',this.peril,').');
};
MapTile.prototype.buffPeril = function (buff)
{
	if (typeof this.peril !== 'undefined')
	{
		this.perilbuffs.push(buff);
		this.notify('perilbuffs', 'add', buff);
	}
	else
		console.warn('Tried to apply a buff ('+buff+') to a tile without peril.');
};
MapTile.prototype.clearPeril = function ()
{
	if (typeof this.peril !== 'undefined')
	{
		var peril = this.perilcard;
		this.peril = undefined;
		this.perilcard = undefined;
		this.perilowner = undefined;
		this.perilbuffs = [];
		this.notify('peril', 'remove', peril);
	}
	else
		console.warn('Tried to clear a peril from a tile without peril.');	
};
//==================================================================================================
function MapMarker(type, coords, title, player)
{
	Observable.call(this);
	this.type = type;
	this.coords = (typeof coords !== 'undefined') ? coords : '-1,-1';
	Object.defineProperty( this, 'u', {
		get : function() {return Number.parseInt(this.coords.split(',')[0]);},
		enumerable : false,
		configurable : false,
	});
	Object.defineProperty( this, 'v', {
		get : function() {return Number.parseInt(this.coords.split(',')[1]);},
		enumerable : false,
		configurable : false,
	});
	this.title = (typeof title !== 'undefined') ? title : '';
	this.player = player;
}
MapMarker.prototype = Object.create(Observable.prototype);
MapMarker.prototype.constructor = MapMarker;
MapMarker.prototype.moveTo = function (coords)
{
	this.coords = coords;
	this.notify('coords', 'change', this.coords);
};
//==================================================================================================
function MatchContext()
{
	Observable.call(this);
	this.active = undefined;
	this.prestige_leader = 0;
	this.round = -1;
	this.proclamation = '';	
	this.pacts = new Array();
}
MatchContext.prototype = Object.create(Observable.prototype);
MatchContext.prototype.constructor = MatchContext;
MatchContext.prototype.setPrestigeLeader = function (player)
{
	this.prestige_leader = player;
	this.notify('prestige_leader', 'change', player);
};
MatchContext.prototype.setDeclaration = function (proclamation)
{
	this.proclamation = proclamation;
	this.notify('proclamation', 'change', proclamation);
};
MatchContext.prototype.setTurn = function(entity)
{
	this.active = entity;
	this.notify('active', 'change', entity);
};
MatchContext.prototype.nextRound = function()
{
	this.round++;
	this.notify('round', 'change', this.round);
};
MatchContext.prototype.addPact = function (type, initiator, recipient)
{
	this.pacts.push({
		type: type,
		initiator: initiator,
		recipient: recipient,
	});
	this.notify('pacts', 'add', this.pacts[this.pacts.length-1]);
};
MatchContext.prototype.breakPactBetween = function (type, p1, p2)
{
	for (var i = this.pacts.length; i >= 0; i--)
		if ( ((this.pacts[i].initiator == p1) && (this.pacts[i].recipient == p2)) ||
			((this.pacts[i].initiator == p2) && (this.pacts[i].recipient == p1)))
			this.pacts.splice(i,1);
	this.notify('pacts', 'change');
};
MatchContext.prototype.clearPactsFor = function (player)
{
	for (var i = this.pacts.length-1; i >= 0; i--)
		if ((this.pacts[i].initiator == player) || (this.pacts[i].recipient == player))
			this.pacts.splice(i,1);
	this.notify('pacts', 'change');
};
MatchContext.prototype.serialize = function()
{
	return JSON.stringify(this);
};
MatchContext.prototype.deserialize = function(data)
{
	var obj = JSON.parse(data);

	this.round = obj.round;
	this.notify('round', 'change', this.round);
	this.active = obj.active;
	this.notify('active', 'change', this.active);
	this.prestige_leader = obj.prestige_leader;
	this.notify('prestige_leader', 'change', this.prestige_leader);
	this.proclamation = obj.proclamation;
	this.notify('proclamation', 'change', this.proclamation);
	this.pacts = obj.pacts;
	this.notify('pacts', 'change', this.pacts);
	
};
//==================================================================================================
function EntityCollection()
{
	SerializableObservableCollection.call(this);
}
EntityCollection.prototype = Object.create(SerializableObservableCollection.prototype);
EntityCollection.prototype.constructor = EntityCollection;
EntityCollection.prototype.deserializeItems = function(data)
{
	var entitycopier = SerializableObservableCollection.getSimpleReviver(Entity);
	var herocopier = SerializableObservableCollection.getSimpleReviver(Hero);
	var reviver = function (obj)
	{ 
		return obj.hasOwnProperty('Prestige') ? herocopier(obj) : entitycopier(obj);
	};
	SerializableObservableCollection.prototype.deserializeItems.call(this, data, reviver);
};
//==================================================================================================
function PlayerCollection()
{
	SerializableObservableCollection.call(this);
}
PlayerCollection.prototype = Object.create(SerializableObservableCollection.prototype);
PlayerCollection.prototype.constructor = PlayerCollection;
PlayerCollection.prototype.deserializeItems = function(data, entities)
{
	var basereviver = SerializableObservableCollection.getSimpleReviver(Player);
	var reviver = function(obj)
	{
		var plr = basereviver(obj);
		plr.setHero(entities.getItemById('id', obj.heroid), obj.corner);
		return plr;
	};
	SerializableObservableCollection.prototype.deserializeItems.call(this, data, reviver);
};
//==================================================================================================
function LevelMap()
{
	SerializableObservableCollection.call(this);
}
LevelMap.prototype = Object.create(SerializableObservableCollection.prototype);
LevelMap.prototype.constructor = LevelMap;
LevelMap.prototype.deserializeItems = function(data)
{
	var tilecopier = SerializableObservableCollection.getSimpleReviver(MapTile);
	SerializableObservableCollection.prototype.deserializeItems.call(this, data, tilecopier);
};
//==================================================================================================
function MarkerCollection()
{
	SerializableObservableCollection.call(this);
}
MarkerCollection.prototype = Object.create(SerializableObservableCollection.prototype);
MarkerCollection.prototype.constructor = MarkerCollection;
MarkerCollection.prototype.deserializeItems = function(data)
{
	var markercopier = SerializableObservableCollection.getSimpleReviver(MapMarker);
	SerializableObservableCollection.prototype.deserializeItems.call(this, data, markercopier);
};
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
// Main event processing routine
MatchState.prototype.processEvent = function (evt)
{
	try
	{
		switch (evt.name)
		{
			// Entities
			case "spawnNPC": this.entities.addNewItem(Entity, evt.entity, evt.type, evt.coords); break;
			case "spawnHero": 
			{
				let hero = new Hero(evt.entity);
				this.entities.addItem(hero);
				let player = this.players.getItemById('id',evt.player);
				player.setHero(hero, evt.corner);
			}; break;
			case "setupHero": 
			{
				let hero = this.entities.getItemById('id', evt.entity);
				hero.setType(evt.type);
				hero.moveTo(evt.coords);
			}; break;
			case "moveEntity": this.entities.getItemById('id', evt.entity).moveTo(evt.coords); break;
			case "killEntity": 
			{
				let ent = this.entities.getItemById('id', evt.entity); 
				if (ent instanceof Hero)
				{
					if (ent.bounty > 0)
						ent.toggleBounty();
					this.context.clearPactsFor(ent.player);
				}
				else
					// apparently entities can receive updates even after they has been killed...
					//this.entities.removeItem(ent);
					// so we just mark them as dead.
					ent.kill();
			}; break;
			case "addEffect": this.entities.getItemById('id', evt.entity).addEffect(evt.card); break;
			case "removeEffect": this.entities.getItemById('id', evt.entity).removeEffect(evt.card); break;
			case "equipCard": this.entities.getItemById('id', evt.entity).equipCard(parseInt(evt.slot), evt.card); break;
			case "unequipCard": this.entities.getItemById('id', evt.entity).unequipCard(evt.slot, evt.card); break;
			case "gainCard": this.players.getItemById('id', evt.player).gainCard(evt.card); break;
			case "loseCard": this.players.getItemById('id', evt.player).loseCard(evt.card); break;
			case "changeStats": this.entities.getItemById('id', evt.entity).changeStat(evt.stat, evt.value); break;
			case "gainPact": this.context.addPact(evt.card, evt.player1, evt.player2); break;
			case "losePact": this.context.breakPactBetween(evt.card, evt.player1, evt.player2); break;
			case "toggleBounty": this.entities.getItemById('id', evt.entity).toggleBounty(); break;
			case "toggleCorrupted": this.entities.getItemById('id', evt.entity).toggleCorrupted(); break;
			// Map tiles
			case "addTile": this.map.addNewItem(MapTile, evt.type, evt.coords, evt.corner); break;
			case "changeTile": this.map.getItemById('coords', evt.coords).changeType(evt.type); break;
			case "putPeril": 
			{
				let id = (evt.owner < 5) ? this.players.getItemById('id', evt.owner).hero.id : evt.owner;
				this.map.getItemById('coords', evt.coords).setPeril(evt.peril, evt.card, id); 
			};break;
			case "buffPeril": 
			{
				let tile = this.map.getItemById('peril', evt.peril);
				tile.buffPeril(evt.card); 
			}; break;
			case "clearPeril": this.map.getItemById('peril', evt.peril).clearPeril(); break;
			// Markers
			case "predictBane": 
			{
				let old;
				while (old = this.markers.getItemById('type', 'banespawn', false))
					this.markers.removeItem(old);
				this.markers.addNewItem(MapMarker, 'banespawn', evt.coords, 'Incoming Bane'); 
			}; break;
			case "spawnSpiritStone":
			{
				this.markers.addNewItem(MapMarker, 'stone', evt.coords, 'Spirit Stone');
			}; break;
			case "removeSpiritStone":
			{
				for (let i = 0; i < this.markers.items.length; i++)
					if ((this.markers.items[i].type == 'stone') && (this.markers.items[i].coords == evt.coords))
					{
						this.markers.removeItem(this.markers.items[i]);
						break;
					}
			}; break;
			case "setQuest": 
			{
				this.markers.removeItemById('player', evt.player, false);
				let player = this.players.getItemById('id', evt.player);
				player.nextQuest();
				this.markers.addNewItem(MapMarker, 'quest', evt.coords, Name(player.hero.type)+" quest #"+player.quests, evt.player);
			}; break;
			// Other
			case "prestigeLeader": this.context.setPrestigeLeader(evt.player); break;
			case "declaration": this.context.setDeclaration(evt.type); break;
			case "playerStart": this.players.addNewItem(Player, evt.player, evt.alias, evt.loc, evt.steam); break;
			case "playerQuit": this.players.getItemById('id', evt.player).quit(); break;
			case "startTurn": this.context.setTurn(evt.entity); break;
			case "endTurn": this.context.setTurn(undefined); break;
			case "nextRound": 
			{
				this.context.nextRound();
				if (this.context.round % 2 == 1) //morning - increase bounty levels
					for (let p = 0; p < 4; p++)
						this.players.items[p].hero.updateBounty();
			}; break;
		}
	}
	catch (err)
	{
		console.error("Error when processing event: ", evt);
		throw err;
	}
};