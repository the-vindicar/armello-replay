// Parser transforms certain lines of the log into arrays of event objects.
// First parameter is an object that initializes additional data to be stored in the Parser object.
// This data can be accessed by ParserItem actions or matchfinder function via context(this).
// Second parameter is an array of objects storing data necessary to initialize ParserItems. 
// 		Objects are expected to have following properties: name, re, map and (optionally) action.
// 		name is a string used as the value of name property of the event object ParserItem generates.
//		re is a regular expression used to recognize the line and extract data from it
//		map is an array of property names in resulting event object. 
// 			Property named after i-th element of this array will have the value of i+1-th capture group (group 0 is whole string).
//			It would be unnecessary if JS supported named groups in regular expressions.
// 		action is a function that finalizes the event object before it's returned. 
//	 		Necessary for certain events due to them requiring additional logic.
//			It takes one argument - event object to finalize, and returns the finalized object.
//			If action is unset or is not a function, event object is returned as is.
//			If action function returns undefined, then event is ignored.
//			Action function is called in the context of the object passed as first parameter. This allows multiple ParserItems to share data.
// Third parameter is a function that will be used to find individual matches (playthroughs) in the log file.
//		detectfunc is expected to take two parameters: line from the log file and position (in bytes) of it's beginning in the file.
//		detectfunc should return either undefined, or an object with information about a single match it found.
//		To allow storing data between detectfunc calls, it's called in the context of the fields object (see first parameter).
//		Typically detectfunc should accumulate data on a single match, returning undefined until it has detected match end. 
//		At which point it should return the finished object. Object should contain the following properties:
//			starttime - string containing timestamp of match beginning
//			endtime - string containing timestamp of match completion
//			startpos - saved position of match beginning in the log file
//			endpos - saved position of match ending in the log file
//			players - array of four objects describing individual players. 
//				Each object should contain player's in-game name(name), Steam ID(steam) and chosen hero(hero).
Parser.Parsers['1.10.0.0'] = new Parser(
	// additional data
	{
		pre_heroes_completed : {},
		re_start : /(\d+:\d+:\d+)\W+Matchmaking: Entering matchmaking state: InGameState/i,
		re_end : /(\d+:\d+:\d+)\W+(?:Matchmaking: Exiting matchmaking state: InGameState|Analytics: (?:AnalyticsController: )?OnAppQuit:)/i,
		re_player : /Gameplay:\s*\[\s*\w+\s*\] Id: \w+, Name:\s*([^,]+), Network Id:\s*(\w+)\s*, Hero:\s*\w+/i,
		re_spawnhero : /NetworkGame: \w+ \[Process\] \w+#Sync#SetupPlayerHero#\d\s+\(Processing\) \(Player(\d), (\d+),/i,
		re_setuphero : /\[Hero (\w+) \((\d+)\):/i,

		heroes_completed : {},
		player_quit_events : [false, false, false, false],
		chat_prepared : undefined,
		disconnect_cache : undefined,
		card_on_hero_cache: undefined,
		card_on_tile_cache: undefined,
	},
	//parser items describe translation of game log lines into event objects
	[
		{name:"spawnNPC", re:/NetworkGame: \w+ \[Process\] \w+#Sync#Spawn(\w+?)(?:AsAuthority)?#\d+\s*\(Processing\) \((\d+), \((-?\d+,-?\d+)\)/i, map:["type", "entity", "coords"]},
		{name:"spawnNPC", re:/NetworkGame: \w+ \[Process\] \S+ Spawn(\w+?)(?:AsAuthority)?\s* \((\d+), \((-?\d+,-?\d+)\)/i, map:["type", "entity", "coords"]},
		// we only learn hero's entity ID here, with no simple way to figure out actual hero type.
		{name:"spawnHero", re:/NetworkGame: \w+ \[Process\] \w+#Sync#SetupPlayerHero#\d  \(Processing\) \(Player(\d), (\d+), \((-?\d+,-?\d+)\)/i, map:["player", "entity", "coords"]},
		{name:"setupHero", re:/\[Hero (\w+) \((\d+)\):.*?Pos=\((-?\d+,-?\d+)\)/i, map:["type", "entity", "coords"], action: function(evt)
			{
				// we only generate "setupHero" event the first time we learn about relationship between hero type and hero's entity ID
				if (!this.heroes_completed[evt.entity])
				{
					this.heroes_completed[evt.entity] = true;
					return evt;
				}
			}
		},
		{name:"moveEntity", re:/Gameplay: Creature\+Message\+SnapPosition: Dispatch\(\[.+? \((\w+)\):.+?Pos=\((-?\d+,-?\d+)\)/, map:["entity", "coords"]},
		{name:"moveEntity", re:/Gameplay: Creature\+Message\+MoveEnd: Dispatch\(\[.+? \((\w+)\):.+?Pos=\((-?\d+,-?\d+)\)/, map:["entity", "coords"]},
		{name:"attack", re:/Combat:\s+(Attacker|Defender): \[.+?\((\d+)\):/i, map:["role", "entity"], action : function(evt)
			{
				if (evt.role === "Attacker")
				{
					this.attacker = evt.entity;
					return undefined;
				}
				else
				{
					evt.attacker = this.attacker;
					evt.defender = evt.entity;
					this.combat_cache = {
						attacker: evt.attacker, 
						attacker_dice: {total:0, parts:[], rolls:[]},
						defender: evt.defender,
						defender_dice: {total:0, parts:[], rolls:[]},
						};
					delete this.attacker;
					delete evt.role;
					delete evt.entity;
					return evt;
				}
			}
		},
		{name:"modifyDiceCounts", re:/Dice: DiceRollConfig\[\[.+? \((\w+)\):.+\]\]: (AddDice|RemoveDice)\((\d+)\) from source (.+?) for a total of (\d+)/, map:["entity", "type", "mod", "source", "value"], action:function(evt)
			{
				if (!this.combat_cache) return undefined;
				let target;
				if (this.combat_cache.attacker == evt.entity)
					target = this.combat_cache.attacker_dice;
				else if (this.combat_cache.defender == evt.entity)
					target = this.combat_cache.defender_dice;
				else
					return undefined;
				target.total = parseInt(evt.value, 10);
				target.parts.push({value:((evt.type == "AddDice")?+1:-1)*parseInt(evt.mod, 10), source:evt.source});
			}
		},
		{name:"resolveDice", re:/Dice: DiceRollConfig\[\[.+? \((\w+)\):.+\]\] PushResolution \[SymbolResData: (\w+),(\w+),(-?\d+),(\w+)\]/i, map:["entity", "symbol", "type", "mod", "source"], action:function(evt)
			{
				if (!this.combat_cache) return undefined;
				let target;
				if (this.combat_cache.attacker == evt.entity)
					target = this.combat_cache.attacker_dice;
				else if (this.combat_cache.defender == evt.entity)
					target = this.combat_cache.defender_dice;
				else
					return undefined;
				target.rolls.push({symbol:evt.symbol, type:evt.type, source:evt.source});
			}
		},
		{name:"combatEnd", re:/Combat: CombatManager\.DoApplyCombat combatResult\.(Attacking|Defending)PlayerResult == CombatResult\.Result\.(\w+)/i, map:["source", "result"], action:function(evt)
			{
				if (!this.combat_cache) return undefined;
				let res = this.combat_cache;
				delete this.combat_cache;
				res.outcome = evt.source + "-" + evt.result;
				res.name = evt.name;
				return res;
			}
		},
		{name:"killEntity", re:/Gameplay: Creature\+Message\+DeathEnd: Dispatch\(\[(?:[^(]+) \((\d+)\):/i, map:["entity"]},
		{name:"applyKingsDecToGuard", re:/KingsDec: KingsEffects\+Message\+ApplyEffectInSequence: Dispatch\(\[King's Guard.+?\((\d+)\):/i, map:["entity"]},
		{name:"predictBane", re:/Gameplay: Tile\+Message\+BaneSpawnSet: Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\).+\], (\w+)\)/i, map:["coords", "active"]},
		{name:"spawnSpiritStone", re:/Gameplay: Tile\+Message\+SpiritStoneSpawned: Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\),/i, map:["coords"]},
		{name:"removeSpiritStone", re:/GameplayVisualization: HeroController\+Message\+SpiritStoneCollectCompleted: Dispatch\(.+?, \[Tile: Pos=\((-?\d+,-?\d+)\),/i, map:["coords"]},
		{name:"addEffect", re:/Gameplay: CreatureStatusEffectManager\+Message\+GainStatusEffect: Dispatch\(\[[^(]+ \((\d+)\):.+?\], StatusEffect\s*\[Source:(\w+)/i, map:["entity", "card"]},
		{name:"removeEffect", re:/Gameplay: CreatureStatusEffectManager\+Message\+LoseStatusEffect: Dispatch\(\[[^(]+ \((\d+)\):.+?\], StatusEffect\s*\[Source:(\w+)/i, map:["entity", "card"]},
		{name:"equipCard", re:/Gameplay: Creature\+Message\+EquipCard: Dispatch\(\[[^\(]+ \((\w+)\).+?\], \[Card \w+: Asset:(\w+) type:\w+ isTemp:\w+\], (\d)/i, map:["entity", "card", "slot"]},
		{name:"unequipCard", re:/Gameplay: Creature\+Message\+UnequipCard: Dispatch\(\[[^(]+ \((\w+)\).+?Card \w+: Asset:(\w+) type:\w+ isTemp:\w+\], (\w+), (\d)/i, map:["entity", "card", "reason", "slot"]},
		{name:"gainCard", re:/Player: Player\+Message\+AddCardToHand: Dispatch\(\[Player.+?\(Player(\d)\):.+?\[Card \w+: Asset:(\w+) type:\w+ isTemp:\w+\], \w+, (\w+)\)/i, map:["player", "card", "source"]},
		{name:"loseCard", re:/Player: Player\+Message\+RemoveCardFromHand: Dispatch\(\[Player.+?\(Player(\d)\):.+?\[Card \w+: Asset:(\w+) type:\w+ isTemp:\w+\]\)/i, map:["player", "card"]},
		{name:"changeStats", re:/Gameplay: CreatureStats\+Message\+ChangeStats: Dispatch\(\[StatsChange: (\w+): creature:\[.+ \((\d+)\):.+?\] mod:(-?\d+) now:(-?\d+)\]\)/i, map:["stat", "entity", "delta", "value"]},
		{name:"playCardOnCreature", re:/Player: Player\+Message\+PlayCardOnCreature: Dispatch\(\[Player .+? \(Player(\d)\):.+?\], \[Card \d+: Asset:(\w+) type:\w+ isTemp:\w+], \[[^\(]+ \((\d+)\):/i, map:["player", "card", "entity"]},
		{name:"preGainPact", re:/Player: Player\+Message\+PlayCardOnCreature: Dispatch\(\[Player .+? \(Player(\d)\):.+?\], \[Card \d+: Asset:(\w+) type:\w+ isTemp:\w+], \[Hero [^\(]+ \((\d+)\):/i, map:["player", "card", "entity"], action: function(evt)
			{
				// we cache info about players playing cards on each other, since a pact is always related to the last card played
				// so we know which card was used to initiate the pact
				this.card_on_hero_cache = {player:evt.player, entity:evt.entity, card:evt.card};
				return undefined;
			}
		},
		{name:"gainPact", re:/Gameplay: HeroPactManager\+Message\+GainPact:/i, map:[], action: function(evt)
			{
				// sadly, there is now no way to get the type of the pact or the players!
				if (this.card_on_hero_cache)
				{
					evt.player = this.card_on_hero_cache.player;
					evt.entity = this.card_on_hero_cache.entity;
					evt.card = this.card_on_hero_cache.card;
					this.card_on_hero_cache = undefined;
					return evt;
				}
				else
					return undefined;
			}
		},
		{name:"toggleBounty", re:/Gameplay: SpecialStatusManager\+Message\+StatusUpdated: Dispatch\(\[Hero \w+ \((\d+)\):.+?\], LeagueOfGeeks.ArmelloEngine.Bounty,/i, map:["entity"]},
		{name:"toggleCorrupted", re:/Gameplay: Corrupted\+Message\+CorruptedChanged: Dispatch\(\[[^(]+ \((\d+)\):.+?\]/i, map:["entity"]},
		{name:"addTile", re:/MapMaking:\s*Creating clan castle tile for quadrant (\w+) on position: \((-?\d+,-?\d+)\),/i, map:["corner", "coords"], 
			action: function (evt) 
			{
				evt.type = "ClanCastle";
				return evt;
			}
		},
		{name:"addTile", re:/MapMaking:\s*Creating clan castle-adjacent plains tile on position: \((-?\d+,-?\d+)\),/i, map:["coords"], 
			action: function (evt) 
			{
				evt.type = "Plains";
				return evt;
			}
		},
		{name:"addTile", re:/MapMaking:\s*Creating King's Palace Tile on position: \((-?\d+,-?\d+)\),/i, map:["coords"], 
			action: function (evt) 
			{
				evt.type = "KingsPalace";
				return evt;
			}
		},
		{name:"addTile", re:/MapMaking:\s*Creating King Tile on position: \((-?\d+,-?\d+)\),/i, map:["coords"], 
			action: function (evt) 
			{
				evt.type = "KingTile";
				return evt;
			}
		},
		{name:"addTile", re:/MapMaking:\s*- Created (?:Feature )?Tile of Type: (\w+) at position: \((-?\d+,-?\d+)\),/i, map:["type", "coords"]},	
		{name:"putPeril", re:/Peril: Tile\+Message\+AddPeril: Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\), Type=\w+\], \[Peril \((\w+)\): Card=\[Card \d+: Asset:(\w+) type:\w+ isTemp:\w+\], OwnerId=(\w+)\]\)/i, map:["coords", "peril", "card", "owner"]},
		{name:"encounterPeril", re:/Gameplay: Creature\+Message\+PerilChallengeBegin: Dispatch\(\[Hero \w+ \((\w+)\):.*?Pos=\((-?\d+,-?\d+)\)/i, map:["entity", "coords"]},
		{name:"takePeril", re:/Player: Player\+Message\+TakePerilEffect: Dispatch\(\[.+?\((\d+)\):.+?\], \[Card \w+: Asset:(\w+).+?\], \[Player .+? \(Player(\d)\):/i, map:["entity", "card", "player"]},
		{name:"playCardOnTile", re:/Player: Player\+Message\+PlayCardOnTile: Dispatch\(\[Player.+?\(Player(\d)\):.+?\], \[Card \w+: Asset:(\w+) type:\w+ isTemp:\w+\], \[Tile: Pos=\((-?\d+,-?\d+)\),/i, map:["player", "card","coords"], 
			action:function (evt)
			{
				this.card_on_tile_cache = {player:evt.player, card:evt.card, coords:evt.coords};
				return evt;
			}
		},
		{name:"buffPeril", re:/Gameplay: Peril\+Message\+SymbolBuffLevelChanged: Dispatch\(\[Peril \((\w+)\):/i, map:["peril"], 
			action:function (evt)
			{
				if (this.card_on_tile_cache)
				{
					evt.player = this.card_on_tile_cache.player;
					evt.card = this.card_on_tile_cache.card;
					evt.coords = this.card_on_tile_cache.coords;
					this.card_on_tile_cache = undefined;
					return evt;
				}
			}
		},
		{name:"buffPeril", re:/Gameplay: Peril\+Message\+StatusEffectAdded: Dispatch\(\[Peril \((\w+)\):/i, map:["peril"],
			action:function (evt)
			{
				if (this.card_on_tile_cache)
				{
					evt.player = this.card_on_tile_cache.player;
					evt.card = this.card_on_tile_cache.card;
					evt.coords = this.card_on_tile_cache.coords;
					this.card_on_tile_cache = undefined;
					return evt;
				}
			}
		},
		{name:"clearPeril", re:/Peril: Tile\+Message\+RemovePeril: Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\), Type=\w+\], \[Peril \((\w+)\): Card=\[Card \d+: Asset:\w+ type:\w+ isTemp:\w+\], OwnerId=\w+\]\)/i, map:["coords", "peril"]},
		{name:"addTileEffect", re:/Gameplay: TileStatusEffectManager\+Message\+GainStatusEffect: Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\), Type=\w+\], StatusEffect\[Source:(\w+)[^,]*,\s*Type:(\w+)\]\)/i, map:["coords", "card", "type"]},
		{name:"settlementChangeOwner", re:/Gameplay: Tile\+Message\+(SettlementReleased|SettlementCaptured): Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\), Type=Settlement\], [^,]+, (\w+),/i, map:["type", "coords", "reason"], action:function(evt)
			{
				if ((evt.reason=='Card') && this.card_on_tile_cache)
				{
					evt.player = this.card_on_tile_cache.player;
					evt.reason = this.card_on_tile_cache.card;
					this.card_on_tile_cache = undefined;
				}
				return evt;
			}
		},
		{name:"setQuest", re:/Quest: OnSpawnQuestComplete - player: Player(\d), quest: \w+, questTilePos: \((-?\d+,-?\d+)\), success: True/i, map:["player", "coords"]},
		{name:"completeQuest", re:/Gameplay: QuestManager\+Message\+CompleteQuest/i, map:[]},
		{name:"prestigeLeader", re:/Gameplay:\s+Game\+Message\+NewPrestigeLeader:\s+Dispatch\(\[Player .+ \(Player(\d)\):/i, map:["player"]},
		{name:"declaration", re:/\[url=\"kingsdec:\/\/(\w+)\"\]/i, map:["type"]},
		{name:"playerStart", re:/Gameplay:\s+\[\s*(\w+)\s*\]\s+Id:\s+Player(\d),\s+Name:\s+([^,]+), Network Id:\s*(\w+),/i, map:["loc", "player", "alias", "steam"]},
		{name:"playerQuit", re:/Matchmaking: NetworkRoomSteam: OnPlayerLeft: .+? \(Player(\d)\), (\w+)/i, map:["player", "reason"], 
			action:function(evt)
			{
				let p = parseInt(evt.player, 10);
				if (!this.player_quit_events[p-1])
				{
					this.player_quit_events[p-1] = true;
					return evt;
				}
				else
					return undefined;
			}
		},
		{name:"nextRound", re:/Game: TurnManager\+Message\+PhaseStartForKing: Dispatch\((\w+)\)/i, map:["type"]},
		{name:"startTurn", re:/Player: Player\+Message\+StartTurn: Dispatch\(\[Player .+ \(Player(\d)\):/i, map:["player"]},
		{name:"startTurn", re:/AI: NPC\+Message\+StartTurn: Dispatch\(\[.+? \((\w+)\):/i, map:["entity"]},
		{name:"endTurn", re:/Gameplay: Player\+Message\+EndTurn: Dispatch\(\[Player .+? \(Player(\d)\)/i, map:["player"]},
		{name:"victory", re:/Winner:\s*\[Player .+ \(Player(\d)\):/i, map:["player"]},
		{name:"chat", re:/NetworkGame: PlayerChat\+Message\+ChatMessageReceived: Dispatch\(Player(\d), (\w+),/i, map:["player", "type"], 
			action: function(evt)
			{
				this.chat_prepared = evt;
				return undefined;
			}
		},
		{name:"chat", re:/Game: \[.+\]: (.+)/i, map:["message"], 
			action: function(evt)
			{
				if (!this.chat_prepared) return undefined;
				this.chat_prepared.message = evt.message;
				let e = this.chat_prepared;
				this.chat_prepared = undefined;
				return e;
			}
		},
	],
	//match detector function returns either match description object or undefined.
	// Example of resulting object:
	// {
	// 	starttime:"10:00:00",	//timestamp from the log file
	// 	startpos: 50000, 		//position in bytes from the beginning of the file
	// 	endtime:"11:30:00", 	//timestamp from the log file
	// 	endpos: 11000000, 		//position in bytes from the beginning of the file
	// 	players: 
	// 	[
	// 		{name: "1337_d00d", steam:"12345678901234567890", hero:"Wolf02"},
	// 		{name: "Rabbid", steam:"12345678901234567890", hero:"Rabbit03"},
	// 		{name: "ThatSneakyBastard", steam:"12345678901234567890", hero:"Rat02"},
	// 		{name: "HulkSMASH", steam:"12345678901234567890", hero:"Bear02"}
	// 	]
	// }
	function (line, pos)
	{
		var match;
		var player;
		// found beginning of the match
		if (match = this.re_start.exec(line)) 
		{
			// all info on previous match (if any) is lost
			this.matchinfo = {starttime:match[1], startpos: pos, endtime:"", endpos: 0, players: []};
			this.pre_heroes_completed = {};
		}
		// found information about a player
		else if ((match = this.re_player.exec(line)) && (typeof this.matchinfo !== 'undefined') && (this.matchinfo.players.length < 4))
			// add player info
			this.matchinfo.players.push({name:match[1], steam:match[2]});
		// found information about player's hero id and it's not set yet
		else if (this.matchinfo && (match = this.re_spawnhero.exec(line)))
		{
			player = this.matchinfo.players[parseInt(match[1])-1];
			if (!player.heroid)
				player.heroid = match[2];
		}
		else if (this.matchinfo && (match = this.re_setuphero.exec(line)) && !this.pre_heroes_completed[match[2]])
		{
			for (let p = 0; p < 4; p++)
				if (this.matchinfo.players[p].heroid == match[2])
				{
					this.matchinfo.players[p].hero = match[1];
					this.pre_heroes_completed[match[2]] = true;
					break;
				}
		}
		// found match ending line
		else if ((match = this.re_end.exec(line)) && (typeof this.matchinfo !== 'undefined'))
		{
			// saving collected info
			var info = this.matchinfo;
			// wiping old info
			delete this.matchinfo;
			// attaching ending data
			info.endtime = match[1];
			info.endpos = pos;
			// this value will be collected by scanFile()
			return info;
			// we only return info when we detect match ending - 
			// which means that incomplete matches (especially ongoing ones!) are never shown
		}
	}
	);