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
Entity.prototype.addEffect = function (effect, no_dupe)
{
	if (typeof no_dupe === "undefined")
		no_dupe = ["AMU", "SIG"];
	if (!this.effects.includes(effect) || !no_dupe.some(function(i){return effect.indexOf(i) == 0;}))
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
function Illusion(id, coords, player, original)
{
	Entity.call(this, id, "Illusion", coords);
	this.playerid = player;
	this.original = original;
}
Illusion.prototype = Object.create(Entity.prototype);
Illusion.prototype.constructor = Illusion;
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
Hero.prototype.setBounty = function(level)
{
	this.bounty = level;
	this.notify('bounty', 'change', this.bounty);
}
//==================================================================================================
function EntityCollection()
{
	SerializableObservableCollection.call(this);
}
EntityCollection.prototype = Object.create(SerializableObservableCollection.prototype);
EntityCollection.prototype.constructor = EntityCollection;
EntityCollection.prototype.getLivingEntity = function (key, value, strict)
{
	for (var i = 0; i < this.items.length; i++)
		if (!this.items[i].dead && this.items[i].hasOwnProperty(key) && (this.items[i][key] == value))
			return this.items[i];
	if ((typeof strict === 'undefined') || strict)
		throw new Error(this.constructor.name+": There is no item with "+key.toString()+" = "+value);
};
EntityCollection.prototype.deserializeItems = function(data)
{
	var entitycopier = SerializableObservableCollection.getSimpleReviver(Entity);
	var illusioncopier = SerializableObservableCollection.getSimpleReviver(Illusion);
	var herocopier = SerializableObservableCollection.getSimpleReviver(Hero);
	var reviver = function (obj)
	{ 
		if (obj.hasOwnProperty('Prestige'))
			return herocopier(obj);
		else if (obj.hasOwnProperty('original'))
			return illusioncopier(obj);
		else
			return entitycopier(obj);
	};
	SerializableObservableCollection.prototype.deserializeItems.call(this, data, reviver);
};
