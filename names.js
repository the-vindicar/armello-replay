// These amulets have not been identified yet:
// Listener: No bonuses, no advantages, just raw proof of player skill. - avaliable to those who pledged Lister or better during Armello's Kickstarter campaign 
// Intimidate: End your turn next to a Creature, they suffer -1 Die until end of next turn. 

function Name(id) { return (id in Name.db) ? Name.db[id] : id; }
function Hint(id) {return (id in Hint.db) ? Hint.db[id] : "";}
function PCard(type) { return '<span class="card" data-id="'+type+'" title="'+Hint(type)+'">'+Name(type)+'</span>'; }
function PDecl(type) { return '<span class="declaration" data-id="'+type+'" title="'+Hint(type)+'">'+Name(type)+'</span>'; }
function PEnt(type, id) { return '<span class="entity" data-id="'+id+'" title="'+Hint(type)+'">'+Name(type)+'</span>'; }

Name.db = {
	// ================ Heroes ================
	Bandit01 : "Twiss",
	Bandit02 : "Sylas",
	Bandit03 : "Horace",
	Bandit04 : "Scarlet",
	Bear01 : "Sana",
	Bear02 : "Brun",
	Bear03 : "Ghor",
	Bear04 : "Yordana",
	Rabbit01 : "Amber",
	Rabbit02 : "Barnaby",
	Rabbit03 : "Elyssia",
	Rabbit04 : "Hargrave",
	Rat01 : "Mercurio",
	Rat02 : "Zosha",
	Rat03 : "Sargon",
	Rat04 : "Griotte",
	Wolf01 : "Thane",
	Wolf02 : "River",
	Wolf03 : "Magna",
	Wolf04 : "Fang",
	King : "The King",
	KingsGuard : "King's Guard",
	Bane : "Bane",
	// ================ Signets ================
	SIG01 : "Black Opal",
	SIG02 : "Obsidian",
	SIG03 : "Ruby",
	SIG04 : "Turquoise",
	SIG05 : "Emerald",
	SIG06 : "Pink Topaz",
	SIG07 : "Diamond",
	SIG08 : "Sunstone",
	SIG09 : "Sapphire",
	SIG10 : "Moonstone",
	SIG11 : "Onyx",
	SIG12 : "Celestite",
	SIG13 : "Jade",
	SIG14 : "Quartz",
	SIG15 : "Amethyst",
	SIG16 : "Amber",
	SIG17 : "Tanzanite",
	SIG18 : "Rainbow Quartz",
	SIG19 : "Rubellite",
	SIG20 : "Aquamarine",
	SIG21 : "Serendibite",
	SIG22 : "Cat's Eye",
	SIG23 : "Spinel",
	SIG24 : "Chrysocolla",
	SIG25 : "Taaffeit",
	SIG26 : "Black Opal", //bandit version
	SIG27 : "Pink Topaz", //bandit version
	SIG28 : "Amethyst", //bandit version
	SIG29 : "Celestite", //bandit version
	// ================ Amulets ================
	AMU01 : "Scratch Amulet",
	AMU02 : "Soak Amulet",
	AMU03 : "Think Amulet",
	AMU04 : "Feel Amulet",
	AMU05 : "Grow Amulet",
	AMU06 : "Watch Amulet",
	AMU07 : "Favour Amulet",
	AMU08 : "Spoil Amulet",
	AMU09:  "Listener Amulet",
	AMU10 : "Dig Amulet",
	AMU11 : "Sprint Amulet",
	AMU12 : "Discipline Amulet",
	AMU13 : "Resist Amulet",
	AMU14 : "Intimidate Amulet",
	AMU15 : "Harmonize Amulet",
	AMU16 : "Decay Amulet",
	// ================ King's Declarations ================
	DECL_0001 : "Tax Time",
	DECL_00016 : "Rot Inspection",
	DECL_00017 : "Fugitives Unleashed",
	DECL_00018 : "Martial Law",
	DECL_00019 : "Black Death",
	DECL_0002 : "Tribute of Spirit",
	DECL_0003 : "Peace Treaty",
	DECL_0004 : "Beasts of Bane",
	DECL_0005 : "For Royal Eyes Only",
	DECL_0006 : "Royal Acquisition",
	DECL_0007 : "The Underdog",
	DECL_0008 : "Sinister Rituals",
	DECL_0009 : "Healthcare",
	DECL_0010 : "Blood Moon",
	DECL_0012 : "King's Mercy",
	DECL_0013 : "Dishonoured Defender",
	DECL_0014 : "Royal Flush",
	DECL_0015 : "Dark Liege",
	DECL_0020 : "Civil Uprising",
	DECL_0021 : "Palace Lockdown",
	DECL_0022 : "War March",
	DECL_0023 : "Fog of War",
	DECL_0024 : "Royal Inquisition",
	DECL_0025 : "Supreme Court",
	DECL_0026 : "Treasury Visit",
	DECL_0027 : "Desperate Defence",
	DECL_0028 : "Desertion!",
	DECL_0029 : "Life Support",
	DECL_0031 : "Cursed Kingdom",
	DECL_0032 : "Private Security",
	DECL_0033 : "Total Famine",
	DECL_0034 : "Dark Storms",
	DECL_0035 : "Royal Challenge",
	DECL_0036 : "Night Maneuvers",
	DECL_0037 : "The Toll Bells Sing",
	DECL_0038 : "Paws of Fate",
	DECL_0039 : "King's Bounties",
	DECL_0040 : "King's Agents",
	DECL_0041 : "Darkest Night",
	DECL_0042 : "Ripped Reality",
	DECL_0043 : "Terror Awakened",
	DECL_0044 : "Rotten Choir",
	DECL_0045 : "Royal Stimulus",
	DECL_0046 : "Rot Rain",
	DECL_0047 : "Highway Fees",
	DECL_0048 : "Green-Eyed Monsters",
	DECL_0049 : "Sovereign City State",
	DECL_0050 : "Burn After Reading",
	DECL_0051 : "War Drums",
	// ================ Cards ================
	KING01 : "Crown of Armello",
	KING02 : "Wyldhide",
	KING03 : "Pride's Edge",
	PPN001 : "Mother's Maze",
	PPS001 : "The Unseen Death",
	PPW001 : "Fool's Fountain",
	PPE001 : "The Tricking Paths",
	CON01 : "Wyld Weed",
	CON02 : "Wyldsap",
	CON03 : "Cub's Blood",
	CON04 : "Throwing Axe",
	CON05 : "Brazenberry Ale",
	CON06 : "Moon Juice",
	CON07 : "Hot Rot Wine",
	CON08 : "Mountain Moss",
	CON09 : "Bubble Tea",
	CON10 : "Poisoned Gift",
	CON11 : "Blackberry Dust",
	CON12 : "Snake Venom",
	FOL01 : "Alchemist",
	FOL02 : "Apothecary",
	FOL03 : "Warlock",
	FOL04 : "Explorer",
	FOL05 : "Apprentice",
	FOL06 : "Blacksmith",
	FOL07 : "The Stranger",
	FOL08 : "Brilliant Fool",
	FOL09 : "Bard",
	FOL10 : "Poison Taster",
	FOL11 : "Berserker",
	FOL12 : "Squire",
	FOL13 : "Conjurer",
	FOL14 : "Diplomat",
	FOL15 : "Miner",
	FOL16 : "Spy Master",
	FOL17 : "Coin Master",
	FOL18 : "Trader",
	ITM01 : "Helm of Heroes",
	ITM02 : "Hand Cannons",
	ITM03 : "Bane Blade",
	ITM04 : "Royal Shield",
	ITM05 : "Masquerade Mask",
	ITM06 : "Moon Scythe",
	ITM07 : "Bane's Claw",
	ITM08 : "Royal Pardon",
	ITM09 : "Winged Boots",
	ITM10 : "Wyldfyre Staff",
	ITM11 : "Trusty Shield",
	ITM12 : "Shining Steel Sword",
	ITM13 : "Adventurer's Kit",
	ITM14 : "War Hammer",
	ITM15 : "Battle Armour",
	ITM16 : "Battle Axe",
	ITM17 : "Marauder Gauntlets",
	ITM18 : "Heavy Plate Armour",
	ITM19 : "Royal Banner",
	ITM20 : "Ranger's Cloak",
	ITM21 : "War Horn",
	ITM22 : "Lord's Scepter",
	ITM23 : "Hare's Halberd",
	ITM24 : "Spy Glass",
	ITM25 : "Longbow",
	ITM26 : "Sailor's Lantern",
	ITM27 : "Oak Spear",
	ITM28 : "Heavy Flail",
	ITM29 : "Feathered Helm",
	ITM30 : "Chainmail Shirt",
	ITM31 : "Bastard Sword",
	ITM32 : "Raven's Beak Dagger",
	ITM33 : "Wyld Talisman",
	ITM34 : "Mirror Cape",
	ITM35 : "Poppet",
	ITM36 : "Lionheart Breastplate",
	ITM37 : "Leather Armour",
	ITM38 : "Poisoned Dagger",
	ITM40 : "Torch",
	ITM41 : "Tower Shield",
	ITM42 : "Iron Pike",
	ITM44 : "Reliable Short Sword",
	ITM45 : "Hero's Shield",
	ITM47 : "Silver Lance",
	ITM48 : "Reaper's Trident",
	ITM50 : "King's Guard Armour",
	ITM52 : "Mahogany Staff",
	MAG01 : "Haste",
	MAG02 : "Tanglevine",
	MAG03 : "Bloodthirst",
	MAG04 : "Lightning Strike",
	MAG05 : "Immolation",
	MAG06 : "Syphon",
	MAG07 : "Spirit Strike",
	MAG08 : "Malice Rising",
	MAG09 : "Focus",
	MAG10 : "Rite of Wyld",
	MAG11 : "Aflame",
	MAG12 : "Banish",
	MAG13 : "Regeneration",
	MAG14 : "Crystallise",
	MAG15 : "Plague",
	MAG16 : "Wyld's Warning",
	MAG17 : "Dark Influence",
	MAG18 : "The Cleansing Wyld",
	MAG19 : "Wake the Trees",
	MAG20 : "Glamour",
	MAG21 : "Blizzard",
	MAG22 : "Mirror Image",
	MAG23 : "Bark Skin",
	MAG24 : "Feral",
	MAG25 : "Moonbite",
	MAG26 : "Evil Eye",
	MAG27 : "Wyld Born",
	MAG28 : "Cursed Lands",
	MAG29 : "Teleport",
	MAG30 : "Wall of Thorns",
	MAG31 : "Shimmer Shield",
	MAG32 : "Call of the Worm",
	MAG33 : "Divination",
	MAG34 : "Leech",
	MAG36 : "Spirit Seeds",
	MAG46 : "Rotten Fog",
	TRK01 : "Hoodwinked",
	TRK02 : "Slanderous Toads",
	TRK03 : "False Orders",
	TRK04 : "Mercenaries",
	TRK05 : "Merry Thieves",
	TRK06 : "Disguise",
	TRK07 : "Rangers",
	TRK08 : "Saboteur",
	TRK09 : "Reprieve",
	TRK10 : "Spy Network",
	TRK11 : "Grand Heist",
	TRK12 : "Strategist",
	TRK13 : "Patronage & Industry",
	TRK14 : "Crime Lord",
	TRK15 : "Game of Thorns",
	TRK16 : "Incite Revolt",
	TRK17 : "Witch Hunters",
	TRK18 : "Bounty",
	TRK19 : "Cat Burglar",
	TRK20 : "Beheaded",
	TRK21 : "Expendables",
	TRK22 : "Bribery",
	TRK23 : "Plague Bearers",
	TRK24 : "Merchant's Agreement",
	TRK25 : "Allies' Pact",
	TRK26 : "Wandering Circus",
	TRK27 : "Crooks",
	TRK28 : "Vile Official",
	TRK29 : "Agent of Misfortune",
	TRK30 : "Hidden Trap",
	TRK31 : "Pick Pockets",
	TRK32 : "Welcoming Party",
	TRK33 : "Emissary",
	TRK34 : "Armistice",
	TRK35 : "Blood Money",
	TRK36 : "Blackmail",
	TRK37 : "Stone Wards",
	TRK38 : "Betty's Bargain Brews",
	TRK38PRE : "Awaiting Betty's Bargain Brews",
	TRK39 : "Simeon's Arms",
	TRK39PRE : "Awaiting Simeon's Arms",
	TRK40 : "Devious Ruse",
	TRK42 : "Sharpshooter",
	TRK43 : "Arson",
	TRK44 : "Roxy's Recruiting",
	TRK45 : "Biff's Black Market",
	TRK44PRE : "Awaiting Roxy's Recruiting",
	TRK45PRE : "Awaiting Biff's Black Market",
	TRK46 : "Palisade Walls",
	BRW01 : "Curse of Valour",
	BRW02 : "Ill Fortune",
	BRW03 : "Curse of Eye",
	BRW04 : "Bloodletting",
	BRW05 : "Curse of Skill",
	// ================ Tile types ================
	ClanCastle : "Clan Grounds",
	KingsPalace : "The Palace",
	KingTile : "Throne Room",
	Plains : "Plains",
	Forest : "Forest",
	Swamp : "Swamp",
	Mountains : "Mountains",
	StoneCircle : "Stone Circle",
	Dungeon : "Dungeon",
	Settlement : "Settlement",
};

Hint.db = {
	// ================ Heroes ================
	Bandit01 : "Pickpocket: Has Evade everywhere except in the Palace. Upon escape, Twiss steals 1 card from her opponent.",
	Bandit02 : "Butcher: For every King's Guard killed, Sylas gains +1 Sword in Battle. Cleared upon death.",
	Bandit03 : "9th Knight: King's Guards will trade tiles with Horace if he moves into their tile, unless he has a Bounty.",
	Bandit04 : "Revolutionary: Scarlet draws a follower card every time she 'rescues' a Terrorized Settlement.",
	Bear01 : "Priestess: When in combat with any corrupted Creature, Sana uses her Spirit as her Fight.",
	Bear02 : "Scarcaster: For every spell cast gain +1 Fight until after Battle or until the end of the next turn.",
	Bear03 : "Guardian: Ending his turn on a Forest makes Ghor immune to the next instance of damage (dawn Health loss from Rot still occurs).",
	Bear04 : "Cauldron Crone: Spells cast to Yordana during her turn are devoured in her cauldron for -1 Magic, granting a Pact Spell at the end of her turn.",
	Rabbit01 : "Tomb Raider: Always have better outcomes when Exploring Dungeons.",
	Rabbit02 : "Tinkerer: Equipping over an Item in your inventory will return that Item to your hand with the cost/gain removed.",
	Rabbit03 : "Architect: Elyssia permanently fortifies settlements she ends her turn on. Fortified settlements grant a bonus defense while in them and cost opponents an extra AP to move into.",
	Rabbit04 : "Cannoneer: After ending his turn on a Plains or Mountain, Hargrave will fire his cannon at any creature entering an adjacent tile. ",
	Rat01 : "Scoundrel: Steal 1 gold from the owner of a Settlement when you claim it.",
	Rat02 : "Shadow: At Night, Zosha gains Stealth everywhere but the Palace.",
	Rat03 : "Veil Gazer: During the draw phase, all cards are face up.",
	Rat04 : "Street Queen: Griotte's Clan Affinity Dice is equal to the number of Trickery Cards played the previous Day.",
	Wolf01 : "Sword Master: Sword cards Burned in Battle Pierce enemy Shields.",
	Wolf02 : "Huntress: When attacking, River shoots her bow for 1 damage before initiating battle. If her target is killed by this ability, River won't move, but still consumes an Action Point.",
	Wolf03 : "Shield Maiden: Shield cards Burned in Battle Reflect damage back at her opponent.",
	Wolf04 : "Berzerker: When attacking, if Fang Slaughters his opponent, Battle ends before they strike back.",
	King : "The King",
	KingsGuard : "King's Guard",
	Bane : "Bane",
	// ================ Signets ================
	SIG01 : "Gain Stealth and +1 sword in Settlements.",
	SIG02 : "Gain Scout on all your claimed Settlements.",
	SIG03 : "First rolled Sword in Battle Explodes.",
	SIG04 : "Gain the Evade Ability and +2 Explode Pool.",
	SIG05 : "Gain +2 Shield on Plains in Battle and Perils.",
	SIG06 : "Doubles Income gained from Settlements.",
	SIG07 : "Gain 1 Prestige for each Treasure Equipped and Follower Recruited.",
	SIG08 : "In Battle and Perils, +1 Sun result while you have more than 3 Gold.",
	SIG09 : "Gain Stealth on Mountains, Day and Night.",
	SIG10 : "Gain +2 Magic for any Kill in Battle.",
	SIG11 : "Gain +2 Gold for any Kill in Battle.",
	SIG12 : "Ignore Mountain movement penalty.",
	SIG13 : "Gain +3 Magic if you are in a Forest at Dawn.",
	SIG14 : "-1 Rot if you are in a Stone Circle at Dawn.",
	SIG15 : "Gain +1 Magic for every Spell Card Burned (+2 if it's a Rot Card).",
	SIG16 : "Burning Sun And Moon cards in Battle is always considered a Hit.",
	SIG17 : "+2 Gold when you escape a Peril.",
	SIG18 : "+1 Magic and +1 Gold every dawn.",
	SIG19 : "+3 Fight when you have less than 4 health.",
	SIG20 : "+1 Moon and +1 Explode Pool if you have less than 3 Rot.",
	SIG21 : "Gain +1 Gold and Prestige each time you kill a King's Guard.",
	SIG22 : "Get a 1 Gold discount on first Trickery Card played each turn.",
	SIG23 : "Get a 20% bonus in all Quests.",
	SIG24 : "Grants Scout on Heroes with 3 Health or less.",
	SIG25 : "+1 Shield and +2 Explode Pool in Forests.",
	SIG26 : "Gain Stealth and +1 Sword in Settlements.", //bandit version
	SIG27 : "Doubles Income gained from Settlements.", //bandit version
	SIG28 : "Gain +1 Magic for every Spell Card Burned (+2 if it's a Rot Card).", //bandit version
	SIG29 : "Ignore Mountain movement penalty.", //bandit version
	// ================ Amulets ================
	AMU01 : "+1 Fight.",
	AMU02 : "+1 Body.",
	AMU03 : "+1 Wits.",
	AMU04 : "+1 Spirit.",
	AMU05 : "+1 Health every Dusk.",
	AMU06 : "Guaranteed first symbol match on Perils.",
	AMU07 : "Start with 2 Prestige. You cannot go below 2 Prestige.",
	AMU08 : "Start Infected with 2 Rot.",
	AMU09 : "Get +1 star after a multiplayer match.",
	AMU10 : "Gain +3 Gold every time you collect a Spirit Stone.",
	AMU11 : "End your turn with 1 or more unused Action Points to gain +1 Action Point next turn.",
	AMU12 : "+2 Clan Affinity Dice Bonus.",
	AMU13 : "Gain +1 Shield in Battles and Perils.",
	AMU14 : "End your turn next to a Creature, they suffer -2 Dice in Battle until end of next turn.",
	AMU15 : "While not Corrupted, in Battles, all Rot Cards in your hand change to Sun symbols.",
	AMU16 : "Heal 2 Health for each Rot gained, and lose 1 Health for each Rot lost.",
	// ================ King's Declarations ================
	DECL_0001 : "Lose 2 gold. If not enough gold, lose 1 prestige.",
	DECL_00016 : "Any hero with 1 or more Rot loses 1 prestige.",
	DECL_00017 : "Four trickery perils appear in the Kingdom.",
	DECL_00018 : "King's guards immediately move to the nearest settlement and terrorize them. Will not fight any heroes currently on settlements.",
	DECL_00019 : "Plague Perils ravage Armello's settlements. Settlements that already have a peril are spared.",
	DECL_0002 : "Lose 2 magic. If not enough magic, lose 1 prestige.",
	DECL_0003 : "Heroes that attack another hero lose 3 prestige until the next dawn.",
	DECL_0004 : "3 Banes will spawn at night.",
	DECL_0005 : "Any hero currently in a stone circle or dungeon, or who enters one before the next dawn, receives a bounty.",
	DECL_0006 : "Steals one randomly equipped item from each hero, if no items are equipped -2 prestige.",
	DECL_0007 : "The hero with the lowest prestige gets a random treasure.",
	DECL_0008 : "All Banes on the map get +2 Fight and +2 Body until next Dawn.",
	DECL_0009 : "Pay 4 gold, if you have less than 4 gold you will become poisoned.",
	DECL_0010 : "Every hero gains +1 rot.",
	DECL_0012 : "The King orders the prestige leader to pass around their renown, giving every other hero 1 prestige.",
	DECL_0013 : "-3 prestige to the prestige leader for their poor performance. King's guards get +2 fight and body.",
	DECL_0014 : "All heroes discard their current hand.",
	DECL_0015 : "Summon four banes to the palace at dawn (will not eject current occupants).",
	DECL_0020 : "All settlements become terrorized.",
	DECL_0021 : "The King places a bounty on the prestige leader's head and recalls all idle King's guards back to the palace.",
	DECL_0022 : "All heroes have bounties put on their heads.",
	DECL_0023 : "All heroes are stealthed until dawn, unless revealed by entering combat or failing a peril.",
	DECL_0024 : "Infected heroes lose 1 HP. Corrupted heroes lose 3 HP.",
	DECL_0025 : "All heroes lose 3 prestige.",
	DECL_0026 : "The prestige leader gives up all of their gold. If they had 5 gold or more, they gain 1 prestige, if not they lose 1 prestige.",
	DECL_0027 : "All palace perils are removed; guards with 1 HP are spawned in their place if the tile was empty.",
	DECL_0028 : "All guards defending the Palace disappear.",
	DECL_0029 : "The King and the prestige leader heal for 1 HP.",
	DECL_0031 : "The King plays Cursed Lands to all normal perils.",
	DECL_0032 : "Plays Mercenaries on all settlements without other perils.",
	DECL_0033 : "Lose 2 gold. If not enough gold, lose 2 health.",
	DECL_0034 : "The King plays 4 Lightning Strike perils to random tiles.",
	DECL_0035 : "Prestige leader given Bounty and +4 Gold.",
	DECL_0036 : "King's guards attack heroes at night (regardless of whether or not you have a bounty).",
	DECL_0037 : "The King loses 2 fight for the rest of the game and a Lightning Strike hits every creature currently inside the palace.",
	DECL_0038 : "Each hero swaps their current hand with another random hero.",
	DECL_0039 : "All bounties are worth +1 extra gold and prestige for the rest of the game.",
	DECL_0040 : "Plays Agent of Misfortune to all existing perils (-1 health per unmatched symbol during peril).",
	DECL_0041 : "Darkest Night",
	DECL_0042 : "Random stone circles received a Banish peril.",
	DECL_0043 : "All banes gain +1 Fight and +1 AP for the rest of the game.",
	DECL_0044 : "Every creature loses 1 Body.",
	DECL_0045 : "Until next dawn, King gives 2 gold for every AP not spent.",
	DECL_0046 : "At dusk, every hero and guard not in a settlement, in the palace, or in their clan grounds takes -2 health.",
	DECL_0047 : "Until next dawn, pay 2 Gold to enter every settlement.",
	DECL_0049 : "One unclaimed settlement gets permanently fortified and Mercenaries and Agent of Misfortune is applied.",
	DECL_0050 : "-2 Prestige from prestige leader and hand is discarded, all drawing decks are re-shuffled and leader gets new random full hand.",
	DECL_0051 : "Bounties to all heroes, add 2 King's Guard.",
	// ================ Cards ================
	CON01 : "Wyld Weed",
	CON02 : "Wyldsap",
	CON03 : "Cub's Blood",
	CON04 : "Throwing Axe",
	CON05 : "Brazenberry Ale",
	CON06 : "Moon Juice",
	CON07 : "Hot Rot Wine",
	CON08 : "Mountain Moss",
	CON09 : "Bubble Tea",
	CON10 : "Poisoned Gift",
	CON11 : "Blackberry Dust",
	CON12 : "Snake Venom",
	FOL01 : "Alchemist",
	FOL02 : "Apothecary",
	FOL03 : "Warlock",
	FOL04 : "Explorer",
	FOL05 : "Apprentice",
	FOL06 : "Blacksmith",
	FOL07 : "The Stranger",
	FOL08 : "Brilliant Fool",
	FOL09 : "Bard",
	FOL10 : "Poison Taster",
	FOL11 : "Berserker",
	FOL12 : "Squire",
	FOL13 : "Conjurer",
	FOL14 : "Diplomat",
	FOL15 : "Miner",
	FOL16 : "Spy Master",
	FOL17 : "Coin Master",
	FOL18 : "Trader",
	ITM01 : "Helm of Heroes",
	ITM02 : "Hand Cannons",
	ITM03 : "Bane Blade",
	ITM04 : "Royal Shield",
	ITM05 : "Masquerade Mask",
	ITM06 : "Moon Scythe",
	ITM07 : "Bane's Claw",
	ITM08 : "Royal Pardon",
	ITM09 : "Winged Boots",
	ITM10 : "Wyldfyre Staff",
	ITM11 : "Trusty Shield",
	ITM12 : "Shining Steel Sword",
	ITM13 : "Adventurer's Kit",
	ITM14 : "War Hammer",
	ITM15 : "Battle Armour",
	ITM16 : "Battle Axe",
	ITM17 : "Marauder Gauntlets",
	ITM18 : "Heavy Plate Armour",
	ITM19 : "Royal Banner",
	ITM20 : "Ranger's Cloak",
	ITM21 : "War Horn",
	ITM22 : "Lord's Scepter",
	ITM23 : "Hare's Halberd",
	ITM24 : "Spy Glass",
	ITM25 : "Longbow",
	ITM26 : "Sailor's Lantern",
	ITM27 : "Oak Spear",
	ITM28 : "Heavy Flail",
	ITM29 : "Feathered Helm",
	ITM30 : "Chainmail Shirt",
	ITM31 : "Bastard Sword",
	ITM32 : "Raven's Beak Dagger",
	ITM33 : "Wyld Talisman",
	ITM34 : "Mirror Cape",
	ITM35 : "Poppet",
	ITM36 : "Lionheart Breastplate",
	ITM37 : "Leather Armour",
	ITM38 : "Poisoned Dagger",
	ITM40 : "Torch",
	ITM41 : "Tower Shield",
	ITM42 : "Iron Pike",
	ITM44 : "Reliable Short Sword",
	ITM45 : "Hero's Shield",
	ITM47 : "Silver Lance",
	ITM48 : "Reaper's Trident",
	ITM50 : "King's Guard Armour",
	ITM52 : "Mahogany Staff",
	MAG01 : "Haste",
	MAG02 : "Tanglevine",
	MAG03 : "Bloodthirst",
	MAG04 : "Lightning Strike",
	MAG05 : "Immolation",
	MAG06 : "Syphon",
	MAG07 : "Spirit Strike",
	MAG08 : "Malice Rising",
	MAG09 : "Focus",
	MAG10 : "Rite of Wyld",
	MAG11 : "Aflame",
	MAG12 : "Banish",
	MAG13 : "Regeneration",
	MAG14 : "Crystallise",
	MAG15 : "Plague",
	MAG16 : "Wyld's Warning",
	MAG17 : "Dark Influence",
	MAG18 : "The Cleansing Wyld",
	MAG19 : "Wake the Trees",
	MAG20 : "Glamour",
	MAG21 : "Blizzard",
	MAG22 : "Mirror Image",
	MAG23 : "Bark Skin",
	MAG24 : "Feral",
	MAG25 : "Moonbite",
	MAG26 : "Evil Eye",
	MAG27 : "Wyld Born",
	MAG28 : "Cursed Lands",
	MAG29 : "Teleport",
	MAG30 : "Wall of Thorns",
	MAG31 : "Shimmer Shield",
	MAG32 : "Call of the Worm",
	MAG33 : "Divination",
	MAG34 : "Leech",
	MAG36 : "Spirit Seeds",
	MAG46 : "Rotten Fog",
	TRK01 : "Hoodwinked",
	TRK02 : "Slanderous Toads",
	TRK03 : "False Orders",
	TRK04 : "Mercenaries",
	TRK05 : "Merry Thieves",
	TRK06 : "Disguise",
	TRK07 : "Rangers",
	TRK08 : "Saboteur",
	TRK09 : "Reprieve",
	TRK10 : "Spy Network",
	TRK11 : "Grand Heist",
	TRK12 : "Strategist",
	TRK13 : "Patronage & Industry",
	TRK14 : "Crime Lord",
	TRK15 : "Game of Thorns",
	TRK16 : "Incite Revolt",
	TRK17 : "Witch Hunters",
	TRK18 : "Bounty",
	TRK19 : "Cat Burglar",
	TRK20 : "Beheaded",
	TRK21 : "Expendables",
	TRK22 : "Bribery",
	TRK23 : "Plague Bearers",
	TRK24 : "Merchant's Agreement",
	TRK25 : "Allies' Pact",
	TRK26 : "Wandering Circus",
	TRK27 : "Crooks",
	TRK28 : "Vile Official",
	TRK29 : "Agent of Misfortune",
	TRK30 : "Hidden Trap",
	TRK31 : "Pick Pockets",
	TRK32 : "Welcoming Party",
	TRK33 : "Emissary",
	TRK34 : "Armistice",
	TRK35 : "Blood Money",
	TRK36 : "Blackmail",
	TRK37 : "Stone Wards",
	TRK38 : "Betty's Bargain Brews",
	TRK39 : "Simeon's Arms",
	TRK40 : "Devious Ruse",
	TRK42 : "Sharpshooter",
	TRK43 : "Arson",
	TRK46 : "Palisade Walls",
};