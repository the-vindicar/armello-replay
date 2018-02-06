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
Parser.Parsers['1.9.0.0'] = new Parser(
	// additional data
	{
		heroes_completed : [false, false, false, false],
		played_cards_cache : {},
		attacker : undefined,
		re_start : /(\d+:\d+:\d+)\W+Matchmaking: Entering matchmaking state: InGameState/i,
		re_end : /(\d+:\d+:\d+)\W+Matchmaking: Exiting matchmaking state: InGameState/i,
		re_player : /Gameplay:\s*\[\s*\w+\s*\] Id: \w+, Name:\s*([^,]+), Network Id:\s*(\w+)\s*, Hero:\s*\w+/i,
		re_setuphero : /\[Hero (\w+) \((\d+)\):\s*Player=Player(\d),\s*Pos=\(-?\d+,-?\d+\)\],/i,
		chat_prepared : undefined,
		disconnect_cache : undefined,
	},
	//parser items describe translation of game log lines into event objects
	[
		{name:"spawnNPC", re:/NetworkGame: \w+ \[Process\] \w+#Sync#Spawn(\w+?)(?:AsAuthority)?#\d+\s*\(Processing\) \((\d+), \((-?\d+,-?\d+)\)/i, map:["type", "entity", "coords"]},
		{name:"spawnNPC", re:/NetworkGame: \w+ \[Process\] \S+ Spawn(\w+?)(?:AsAuthority)?\s* \((\d+), \((-?\d+,-?\d+)\)/i, map:["type", "entity", "coords"]},
		// we only learn hero's entity ID here, with no simple way to figure out actual hero type.
		{name:"spawnHero", re:/NetworkGame: \w+ \[Process\] \w+#Sync#SetupPlayerHero#\d  \(Processing\) \(Player(\d), (\d+), (\w+)\)/i, map:["player", "entity", "corner"]},
		{name:"setupHero", re:/\[Hero (\w+) \((\d+)\):\s*Player=Player(\d),\s*Pos=\((-?\d+,-?\d+)\)\],/i, map:["type", "entity", "player", "coords"], action: function(evt)
			{
				var p = Number.parseInt(evt.player)-1;
				// we only generate "setupHero" event the first time we learn about relationship between hero type and hero's entity ID
				if (!this.heroes_completed[p])
				{
					this.heroes_completed[p] = true;
					return evt;
				}
			}
		},
		{name:"moveEntity", re:/Gameplay: Creature\+Message\+SnapPosition: Dispatch\(\[.+? \((\w+)\):.+?Pos=\((-?\d+,-?\d+)\)/, map:["entity", "coords"]},
		{name:"moveEntity", re:/Gameplay: Creature\+Message\+MoveEnd: Dispatch\(\[.+? \((\w+)\):.+?Pos=\((-?\d+,-?\d+)\)/, map:["entity", "coords"]},
		{name:"attack", re:/Combat:\s+(Attacker|Defender): \[.+?\((\w+)\):/i, map:["role", "entity"], action : function(evt)
			{
				if (evt.role === "Attacker")
				{
					this.attacker = evt.entity;
					return undefined;
				}
				else
				{
					evt.attacker = this.attacker;;
					evt.defender = evt.entity;
					delete evt.role;
					delete evt.entity;
					return evt;
				}
			}
		},
		{name:"killEntity", re:/Gameplay: Creature\+Message\+DeathEnd: Dispatch\(\[(?:[^(]+) \((\d+)\):/i, map:["entity"]},
		{name:"predictBane", re:/Gameplay: Tile\+Message\+BaneSpawnSet: Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\),/i, map:["coords"]},
		{name:"spawnSpiritStone", re:/Gameplay: Tile\+Message\+SpiritStoneSpawned: Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\),/i, map:["coords"]},
		{name:"removeSpiritStone", re:/GameplayVisualization: HeroController\+Message\+SpiritStoneCollectCompleted: Dispatch\((?:\[.+?\])?, \[Tile: Pos=\((-?\d+,-?\d+)\),/i, map:["coords"]},
		{name:"addEffect", re:/Gameplay: CreatureStatusEffectManager\+Message\+GainStatusEffect: Dispatch\(\[[^(]+ \((\d+)\):.+?\], StatusEffect\s*\[Source:(\w+),\s*Type:\w+\s*\]\)/i, map:["entity", "card"]},
		{name:"removeEffect", re:/Gameplay: CreatureStatusEffectManager\+Message\+LoseStatusEffect: Dispatch\(\[[^(]+ \((\d+)\):.+?\], StatusEffect\s*\[Source:(\w+),\s*Type:\w+\s*\]\)/i, map:["entity", "card"]},
		{name:"equipCard", re:/Gameplay: Creature\+Message\+EquipCard: Dispatch\(\[[^\(]+ \((\w+)\).+?\], \[Card \w+: Asset:(\w+) type:\w+ isTemp:\w+\], (\d)/i, map:["entity", "card", "slot"]},
		{name:"unequipCard", re:/Gameplay: Creature\+Message\+UnequipCard: Dispatch\(\[[^(]+ \((\w+)\).+?Card \w+: Asset:(\w+) type:\w+ isTemp:\w+\], (\w+), (\d)/i, map:["entity", "card", "reason", "slot"]},
		{name:"gainCard", re:/Player: Player\+Message\+AddCardToHand: Dispatch\(\[Player.+?\(Player(\d)\):.+?\[Card \w+: Asset:(\w+) type:\w+ isTemp:False\], \w+, (\w+)\)/i, map:["player", "card", "source"]},
		{name:"loseCard", re:/Player: Player\+Message\+RemoveCardFromHand: Dispatch\(\[Player.+?\(Player(\d)\):.+?\[Card \w+: Asset:(\w+) type:\w+ isTemp:False\]\)/i, map:["player", "card"]},
		{name:"changeStats", re:/Gameplay: CreatureStats\+Message\+ChangeStats: Dispatch\(\[StatsChange: (\w+): creature:\[.+ \((\d+)\):.+?\] mod:(-?\d+) now:(-?\d+)\]\)/i, map:["stat", "entity", "delta", "value"]},
		{name:"playCardOnCreature", re:/Player: Player\+Message\+PlayCardOnCreature: Dispatch\(\[Player .+? \(Player(\d)\): .+?\((\d+)\), [^\]]*\], \[Card \d+: Asset:(\w+) type:\w+ isTemp:\w+], \[[^\(]+ \((\d+)\):/i, map:["player1", "entity1", "card", "entity2"]},
		{name:"playCardOnHero", re:/Player: Player\+Message\+PlayCardOnCreature: Dispatch\(\[Player .+? \(Player(\d)\): .+?\((\d+)\), [^\]]*\], \[Card \d+: Asset:(\w+) type:\w+ isTemp:\w+], \[[^\(]+ \((\d+)\): .*?Player=Player(\d),/i, map:["player1", "entity1", "card", "entity2", "player2"], action: function(evt)
			{
				// we cache info about players playing cards on each other, since a pact is always related to the last card played
				// so we know which card was used to initiate the pact
				this.played_cards_cache[evt.player1+"to"+evt.player2] = evt.card;
			}
		},
		{name:"playCardOnTile", re:/Player: Player\+Message\+PlayCardOnTile: Dispatch\(\[Player .+ \(Player(\d)\): Hero=\w+ \((\w+)\),[^\]]+\], \[Card \w+: Asset:(\w+) type:\w+ isTemp:\w+\], \[Tile: Pos=\((-?\d+,-?\d+)\), Type=\w+\],\s*\)/i, map:["player", "entity", "card", "coords"]},
		{name:"gainPact", re:/Gameplay: HeroPactManager\+Message\+GainPact: Dispatch\(\[[^(]+ \(\d+\): Player=Player(\d),[^]]*\], \[[^(]+ \(\d+\): Player=Player(\d),[^]]*\]/i, map:["player1", "player2"], action: function(evt)
			{
				// sadly, there is no way to get the type of the pact, so we have to rely on our cache
				var x = this.played_cards_cache[evt.player1+"to"+evt.player2];
				if (typeof x !== 'undefined')
				{
					evt.card = x;
					delete this.played_cards_cache[evt.player1+"to"+evt.player2];
					return evt;
				}
				else
					return null;
			}
		},
		// BUGGED - can't determine which pact to drop =(
		{name:"losePact", re:/Gameplay: HeroPactManager\+Message\+LosePact: Dispatch\(\[[^(]+ \(\d+\): Player=Player(\d),[^]]*\], \[[^(]+ \(\d+\): Player=Player(\d),[^]]*\]/i, map:["player1", "player2"]},
		{name:"toggleBounty", re:/Gameplay: Bounty\+Message\+BountyActiveChanged: Dispatch\(\[[^(]+ \((\d+)\):.+?\]/i, map:["entity"]},
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
		//{name:"changeTile", re:"", map:[]},
		{name:"putPeril", re:/Peril: Tile\+Message\+AddPeril: Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\), Type=\w+\], \[Peril \((\w+)\): Card=\[Card \d+: Asset:(\w+) type:\w+ isTemp:\w+\], OwnerId=(\w+)\]\)/i, map:["coords", "peril", "card", "owner"]},
		{name:"encounterPeril", re:/Gameplay: Creature\+Message\+PerilChallengeBegin: Dispatch\(\[Hero \w+ \((\w+)\): Player=Player(\d+), Pos=\((-?\d+,-?\d+)\)/i, map:["entity", "player", "coords"]},
		{name:"buffPeril", re:/Gameplay: Peril\+Message\+SymbolBuffLevelChanged: Dispatch\(\[Peril \((\w+)\): Card=\[Card \w+: Asset:(\w+) type:\w+ isTemp:\w+\], OwnerId=\w+\], (-?\d+)\)/i, map:["peril", "card", "value"]},
		{name:"buffPeril", re:/Gameplay: Peril\+Message\+StatusEffectAdded: Dispatch\(\[Peril \((\w+)\): Card=\[Card \w+: Asset:(\w+) type:\w+ isTemp:\w+], OwnerId=\w+\]\)/i, map:["peril", "card"]},
		{name:"clearPeril", re:/Peril: Tile\+Message\+RemovePeril: Dispatch\(\[Tile: Pos=\((-?\d+,-?\d+)\), Type=\w+\], \[Peril \((\w+)\): Card=\[Card \d+: Asset:\w+ type:\w+ isTemp:\w+\], OwnerId=\w+\]\)/i, map:["coords", "peril"]},
		{name:"setQuest", re:/Quest: OnSpawnQuestComplete - player: Player(\d), quest: \w+, questTilePos: \((-?\d+,-?\d+)\), success: True/i, map:["player", "coords"]},
		{name:"prestigeLeader", re:/Gameplay:\s+Game\+Message\+NewPrestigeLeader:\s+Dispatch\(\[Player .+ \(Player(\d)\):/i, map:["player"]},
		{name:"declaration", re:/\[url=\"kingsdec:\/\/(\w+)\"\]/i, map:["type"]},
		{name:"playerStart", re:/Gameplay:\s+\[\s*(\w+)\s*\]\s+Id:\s+Player(\d),\s+Name:\s+([^,]+), Network Id:\s*(\w+),/i, map:["loc", "player", "alias", "steam"]},
		{name:"playerQuit", re:/Matchmaking: NetworkRoomSteam: OnRoomPlayerDisconnected: .+ \(Player(\d)\), error (\w+)/i, map:["player", "reason"]},
		{name:"nextRound", re:/Game: TurnManager\+Message\+PhaseStartForKing: Dispatch\((\w+)\)/i, map:["type"]},
		{name:"startTurn", re:/Player: Player\+Message\+StartTurn: Dispatch\(\[Player .+ \(Player(\d)\): [^(]+ \((\w+)\)/i, map:["player", "entity"]},
		{name:"startTurn", re:/AI: NPC\+Message\+StartTurn: Dispatch\(\[.+? \((\w+)\):/i, map:["entity"]},
		{name:"endTurn", re:/Gameplay: Player\+Message\+EndTurn: Dispatch\(\[Player .+? \(Player(\d)\): .+? \((\w+)\)/i, map:["player", "entity"],},
		{name:"victory", re:/Winner: \[Player .+ \(Player(\d)\): [^(]+ \((\w+)\)/i, map:["player", "entity"]},
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
			// all info on previous match (if any) is lost
			this.matchinfo = {starttime:match[1], startpos: pos, endtime:"", endpos: 0, players: []};
		// found information about a player
		else if ((match = this.re_player.exec(line)) && (typeof this.matchinfo !== 'undefined') && (this.matchinfo.players.length < 4))
			// add player info
			this.matchinfo.players.push({name:match[1], steam:match[2]});
		// found information about player's hero and it's not set yet
		else if (this.matchinfo && 
				(match = this.re_setuphero.exec(line)) && 
				(player = this.matchinfo.players[parseInt(match[3])-1]) &&
				(!player.hero))
			player.hero = match[1];
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