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
	const traders = ['TRK38','TRK39','TRK44','TRK45'];
	const traders_pre = ['TRK38PRE','TRK39PRE','TRK44PRE','TRK45PRE'];
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
			}; break;
			case "setupHero": 
			{
				let hero = this.entities.getItemById('id', evt.entity);
				hero.setType(evt.type);
				hero.moveTo(evt.coords);
			}; break;
			case "moveEntity": this.entities.getItemById('id', evt.entity).moveTo(evt.coords); break;
			case "attack":
			{
				let attacker = this.entities.getItemById('id', evt.attacker);
				let defender = this.entities.getItemById('id', evt.defender);
				if ((attacker instanceof Hero) && (defender.type == 'King'))
					attacker.setBounty(3);
			}; break
			case "killEntity": 
			{
				let ent = this.entities.getItemById('id', evt.entity); 
				if (ent instanceof Hero)
				{
					if (ent.bounty > 0)
						ent.toggleBounty();
					this.context.clearPactsFor(ent.playerid);
				}
				else
					// apparently entities can receive updates even after they has been killed...
					//this.entities.removeItem(ent);
					// so we just mark them as dead.
					ent.kill();
			}; break;
			case "applyKingsDecToGuard": if (this.context.proclamation == 'DECL_0028')
			{
				let ent = this.entities.getItemById('id', evt.entity); 
				ent.kill();
			}; break;
			case "addEffect": this.entities.getItemById('id', evt.entity).addEffect(evt.card); break;
			case "removeEffect": this.entities.getItemById('id', evt.entity).removeEffect(evt.card); break;
			case "equipCard": this.entities.getItemById('id', evt.entity).equipCard(parseInt(evt.slot), evt.card); break;
			case "unequipCard": this.entities.getItemById('id', evt.entity).unequipCard(evt.slot, evt.card); break;
			case "gainCard": this.players.getItemById('id', evt.player).gainCard(evt.card); break;
			case "loseCard": this.players.getItemById('id', evt.player).loseCard(evt.card); break;
			case "changeStats": 
			{
				let ent = this.entities.getItemById('id', evt.entity);
				let before = ent[evt.stat];
				ent.changeStat(evt.stat, evt.value);
				let after = ent[evt.stat];
				// As of 1.10 there are no more "hero corrupted" log events. We do it manually.
				if ((evt.stat == 'Rot') && (ent instanceof Hero) && ((before < 5) != (after < 5)))
					ent.toggleCorrupted();
			}; break;
			case "gainPact": 
			{
				let p1 = evt.player;
				let p2 = this.entities.getItemById('id', evt.entity).playerid;
				this.context.addPact(evt.card, p1, p2); 
			}; break;
			case "losePact": this.context.breakPactBetween(evt.card, evt.player1, evt.player2); break;
			case "toggleBounty": this.entities.getItemById('id', evt.entity).toggleBounty(); break;
			// RIP as of 1.10
			//case "toggleCorrupted": this.entities.getItemById('id', evt.entity).toggleCorrupted(); break;
			// Map tiles
			case "addTile": 
			{
				if (!this.map.getItemById('coords', evt.coords, false))
					this.map.addNewItem(MapTile, evt.type, evt.coords, evt.corner); 
			}; break;
			case "addTileEffect": if (evt.card != 'None')
			{
				let tile = this.map.getItemById('coords', evt.coords);
				tile.addEffect(evt.card);
			}; break;
			case "playCardOnTile":
			{
				let tile = this.map.getItemById('coords', evt.coords);
				switch (evt.card+'>'+tile.type)
				{
					case 'MAG36>Swamp': tile.changeType('Forest'); break; //Spirit Seeds
					case 'TRK43>Forest': tile.changeType('Swamp'); break; //Arson
					case 'TRK46>Settlement': tile.addEffect('TRK46'); break; //Palisade Walls
					default:
					{
						let trdid = traders.indexOf(evt.card);
						if ((trdid >= 0) && (tile.type == 'Settlement'))
						{
							tile.removeEffect.apply(tile, traders);
							tile.removeEffect.apply(tile, traders_pre);
							tile.addEffect(traders_pre[trdid]);
						}
					}
				}
	
			}; break;
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
			case "settlementChangeOwner":
			{
				let tile = this.map.getItemById('coords', evt.coords);
				// TRK33 == Emissary
				let entityid;
				if ((evt.reason == 'Entity') || (evt.reason == 'BaneTerrorise' ) || (evt.reason == 'KingsGuardTerrorise') || (evt.reason == 'HeroClaim')) 
				{
					let entity = this.entities.getLivingEntity('coords', evt.coords, false);
					entityid = entity ? entity.id : undefined;
				}
				else if (evt.entity)
					entityid = evt.entity;
				else if (evt.player)
				{
					let player = this.players.getItemById('id',evt.player);
					entityid = player.heroid;
				}
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
				{
					tile.captureSettlement(entityid);
				}
			}; break;
			// Markers
			case "predictBane": 
			{
				if (evt.active == 'True')
					this.markers.addNewItem(MapMarker, 'banespawn', evt.coords, 'Incoming Bane');
				else
					this.markers.removeItemById('coords', evt.coords);
			}; break;
			case "predictSpiritStone":
			{
				if (evt.active == 'True')
					this.markers.addNewItem(MapMarker, 'stonespawn', evt.coords, 'Incoming Spirit Stone');
				else
					this.markers.removeItemById('coords', evt.coords);
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
				let player = this.players.getItemById('id', evt.player);
				player.nextQuest();
				this.markers.addNewItem(MapMarker, 'quest', evt.coords, Name(player.hero.type)+" quest #"+player.quests, evt.player);
			}; break;
			case "completeQuest":
			{
				let hero = this.entities.getItemById('id', this.context.active);
				if (!(hero instanceof Hero)) return;
				let quest = this.markers.getItemById('player', hero.playerid, false);
				if (quest && (hero.coords == quest.coords)) // a story quest
				{
					this.markers.removeItem(quest);
				}
				else
				{
					let tile = this.map.getItemById('coords', hero.coords);
					// Roxy's Recruiting & Biff's Black Market
					if (tile.hasEffect('TRK44') || tile.hasEffect('TRK45'))
						tile.removeEffects('TRK44', 'TRK45');
				}
			}; break;
			// Other
			case "prestigeLeader": this.context.setPrestigeLeader(evt.player); break;
			case "declaration": this.context.setDeclaration(evt.type); break;
			case "playerStart": 
			{
				if (typeof this.players.getItemById('id', evt.player, false) === 'undefined')
					this.players.addNewItem(Player, evt.player, evt.alias, evt.loc, evt.steam); 
			}; break;
			case "playerQuit": this.players.getItemById('id', evt.player).quit(); break;
			case "startTurn": 
			{
				let entity = evt.entity ? evt.entity : this.entities.getItemById('playerid', evt.player).id;
				this.context.setTurn(entity); 
			}; break;
			case "endTurn": this.context.setTurn(undefined); break;
			case "nextRound": 
			{
				this.context.nextRound();
				if (this.context.round % 2 == 1) //morning - increase bounty levels
				{
					for (let p = 0; p < 4; p++)
						this.players.items[p].hero.updateBounty();
					for (let i = 0; i < this.map.items.length; i++)
					{
						let item = this.map.items[i];
						item.removeEffects('MAG30', 'MAG46');
					}
				}
				for (let i = 0; i < this.map.items.length; i++)
				{
					let item = this.map.items[i];
					if (item.type == 'Settlement')
					{
						item.removeEffects.apply(item, traders);
						for (let j = 0; j < traders_pre.length; j++)
							if (item.hasEffect(traders_pre[j]))
							{
								item.removeEffect(traders_pre[j]);
								item.addEffect(traders[j]);
							}
					}
				}
			}; break;
		}
	}
	catch (err)
	{
		console.error("Error when processing event: ", evt);
		throw err;
	}
};