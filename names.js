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
	Dragon01: "Volodar",
	Dragon02: "Agniya",
	Dragon03: "Oxana",
	Dragon04: "Nazar",
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
	SIG30 : "Cinnabar", //bandit version
	SIG35 : "Sulfur",
	SIG36: "Basalt",
	SIG37: "Axinite",
	SIG38: "Cinnabar",
	SIG39: "Tremolite",
	SIG40: "Serpentine",
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
	AMU21 : "Ruin Amulet",
	// ================ Other things ================
	PERMASCOUT: "Scout",
	None : "Intimidated", // >_< LoG couldn't make it less obtuse.
	// ================ King's Declarations (new) ================
	"0xC121AA76" : "Tax Time",
	"0xC121AA77" : "Tribute of Spirit",
	"0xC121AA78" : "Peace Treaty",
	"0xC121AA79" : "Beasts of Bane",
	"0xC121AA7A" : "For Royal Eyes Only",
	"0xC121AA7B" : "Royal Acquisition",
	"0xC121AA7C" : "The Underdog",
	"0xC121AA7D" : "Sinister Rituals",
	"0xC121AA7E" : "Healthcare",
	"0xC121AA94" : "Blood Moon",
	"0xC121AA96" : "King's Mercy",
	"0xC121AA97" : "Dishonoured Defender", //???
	"0xC121AA98" : "Royal Flush",
	"0xC121AA99" : "Dark Liege", //???
	"0x6313A480" : "Rot Inspection", 
	"0x6313A481" : "Fugitives Unleashed",
	"0x6313A482" : "Martial Law",
	"0x6313A483" : "Black Death",
	"0xC121AAB3" : "Civil Uprising",
	"0xC121AAB4" : "Palace Lockdown",
	"0xC121AAB5" : "War March", //???
	"0xC121AAB6" : "Fog of War",
	"0xC121AAB7" : "Royal Inquisition",
	"0xC121AAB8" : "Supreme Court",
	"0xC121AAB9" : "Treasury Visit",
	"0xC121AABA" : "Desperate Defence",
	"0xC121AABB" : "Desertion!",
	"0xC121AABC" : "Life Support",
	"0xC121AAD3" : "Cursed Kingdom",
	"0xC121AAD4" : "Private Security",
	"0xC121AAD5" : "Total Famine",
	"0xC121AAD6" : "Dark Storms",
	"0xC121AAD7" : "Royal Challenge",
	"0xC121AAD8" : "Night Maneuvers",
	"0xC121AAD9" : "The Toll Bells Sing",
	"0xC121AADA" : "Paws of Fate",
	"0xC121AADB" : "King's Bounties",
	"0xC121AAF1" : "King's Agents",
	"0xC121AAF2" : "Darkest Night", //no longer in the game
	"0xC121AAF3" : "Ripped Reality",
	"0xC121AAF4" : "Terror Awakened",
	"0xC121AAF5" : "Rotten Choir",
	"0xC121AAF6" : "Royal Stimulus",
	"0xC121AAF7" : "Rot Rain", 
	"0xC121AAF8" : "Highway Fees",
	"0xC121AAF9" : "Green-Eyed Monsters",
	"0xC121AAFA" : "Sovereign City State",
	"0xC121AB10" : "Burn After Reading",
	"0xC121AB11" : "War Drums",
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
	CON13 : "Illusion", //Nazar's hero power is tied to this card.
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
	Dragon01: "Enthrall: End your turn near a Bane to enthrall it. Enthralled Bane won't attack you, but will immediately attack any other Hero or Guard entering an adjacent tile.",
	Dragon02: "Concecrate: After Agniya kills a Creature in Battle, she gains the Worm's Blessing, +1 Health at the start of your turn for next 2 turns.",
	Dragon03: "Flagellant: When attacking another hero, Oxana destroys a random spell card in their hand, locking that symbol into her combat shelf and adding the card's Magic cost to her explode pool.",
	Dragon04: "Deceiver: At the start of his Turn after drawing Cards, Nazar gains an Illusion consumable card, allowing him to send an illusion of himself to an adjacent tile, this card is discarded at the end of his Turn.",
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
	SIG30 : "On the loss of any Prestige, add a random 1 Magic Cost Spell Card to your Hand.", //bandit version
	SIG35 : "Negates Swamp Damage.",
	SIG36 : "On Dungeons, gain Stealth and first rolled Sword in Battles is Poisoned.",
	SIG37 : "On Creature Kill in combat, gain +1 Die in Battles and Perils until the end of your next Turn.",
	SIG38 : "On the loss of any Prestige, add a random 1 Magic Cost Spell Card to your Hand.",
	SIG39 : " +1 Rot. Ending your turn next to a creature makes them gain +1 Rot until the end of their next turn.",
	SIG40 : "On Quest completion, -1 Rot. Gain +3 Magic if Rot is deducted this way.",
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
	AMU14 : "End your turn next to a creature, they suffer -2 Dice in Battle until end of next turn.",
	AMU15 : "While not Corrupted, in Battles, all Rot Cards in your hand change to Sun symbols.",
	AMU16 : "Heal 2 Health for each Rot gained, and lose 1 Health for each Rot lost.",
	AMU21 : "Upon entering a Settlement, Terrorize it and gain +1 Rot.",
	// ================ Other things ================
	PERMASCOUT: "This hero has played the goblins' game.",
	None : "Suffer -2 Dice in Battle until end of next turn.",
	// ================ King's Declarations (new) ================
	"0xC121AA76" : "Lose 2 gold. If not enough gold, lose 1 prestige.",
	"0xC121AA77" : "Lose 2 magic. If not enough magic, lose 1 prestige.",
	"0xC121AA78" : "Heroes that attack another hero lose 3 prestige until the next dawn.",
	"0xC121AA79" : "3 Banes will spawn at night.",
	"0xC121AA7A" : "Any hero currently in a stone circle or dungeon, or who enters one before the next dawn, receives a bounty.",
	"0xC121AA7B" : "Steals one randomly equipped item from each hero, if no items are equipped -2 prestige.",
	"0xC121AA7C" : "The hero with the lowest prestige gets a random treasure.",
	"0xC121AA7D" : "All Banes on the map get +2 Fight and +2 Body until next Dawn.",
	"0xC121AA7E" : "Pay 4 gold, if you have less than 4 gold you will become poisoned.",
	"0xC121AA94" : "Every hero gains +1 rot.",
	"0xC121AA96" : "The King orders the prestige leader to pass around their renown, giving every other hero 1 prestige.",
	"0xC121AA97" : "-3 prestige to the prestige leader for their poor performance. King's guards get +2 fight and body.",
	"0xC121AA98" : "All heroes discard all cards in their hand.",
	"0xC121AA99" : "Summon four banes to the palace at dawn (will not eject current occupants).",
	"0x6313A480" : "Any hero with 1 or more Rot loses 1 prestige.",
	"0x6313A481" : "Four trickery perils appear in the Kingdom.",
	"0x6313A482" : "King's guards immediately move to the nearest settlement and terrorize them. Will not fight any heroes currently on settlements.",
	"0x6313A483" : "Plague Perils ravage Armello's settlements. Settlements that already have a peril are spared.",
	"0xC121AAB3" : "All settlements become terrorized.",
	"0xC121AAB4" : "The King places a bounty on the prestige leader's head and recalls all idle King's guards back to the palace.",
	"0xC121AAB5" : "All heroes have bounties put on their heads.",
	"0xC121AAB6" : "All heroes are stealthed until dawn, unless revealed by entering combat or failing a peril.",
	"0xC121AAB7" : "Infected heroes lose 1 HP. Corrupted heroes lose 3 HP.",
	"0xC121AAB8" : "All heroes lose 3 prestige.",
	"0xC121AAB9" : "The prestige leader gives up all of their gold. If they had 5 gold or more, they gain 1 prestige, if not they lose 1 prestige.",
	"0xC121AABA" : "All palace perils are removed; guards with 1 HP are spawned in their place if the tile was empty.",
	"0xC121AABB" : "All guards defending the Palace disappear.",
	"0xC121AABC" : "The King and the prestige leader heal for 1 HP.",
	"0xC121AAD3" : "The King plays Cursed Lands to all normal perils.",
	"0xC121AAD4" : "Plays Mercenaries on all settlements without other perils.",
	"0xC121AAD5" : "Lose 2 gold. If not enough gold, lose 2 health.",
	"0xC121AAD6" : "The King plays 4 Lightning Strike perils to random tiles.",
	"0xC121AAD7" : "Prestige leader is given a Bounty and +4 Gold.",
	"0xC121AAD8" : "King's guards attack heroes at night (regardless of whether or not you have a bounty).",
	"0xC121AAD9" : "The King loses 2 fight for the rest of the game and a Lightning Strike hits every creature currently inside the palace.",
	"0xC121AADA" : "Each hero swaps their current hand with another random hero.",
	"0xC121AADB" : "Anyone who gets a bounty until the next morning will start as a Fugitive.",
	"0xC121AAF1" : "Plays Agent of Misfortune to all existing perils (-1 health per unmatched symbol during peril).",
	"0xC121AAF2" : "Darkest Night", //no longer in the game
	"0xC121AAF3" : "Random stone circles received a Banish peril.",
	"0xC121AAF4" : "All banes gain +1 Fight and +1 AP for the rest of the game.",
	"0xC121AAF5" : "Every creature loses 1 Body.",
	"0xC121AAF6" : "Until next dawn, King gives 2 gold for every AP not spent.",
	"0xC121AAF7" : "At dusk, every hero and guard not in a settlement, in the palace, or in their clan grounds takes -2 health.",
	"0xC121AAF8" : "Until next dawn, pay 2 Gold to enter a settlement.",
	"0xC121AAF9" : "For every 3 Gold any hero has, that hero gains 1 Gold and loses 1 Prestige.",
	"0xC121AAFA" : "One unclaimed settlement gets permanently fortified, gains Mercenaries Peril and Agent of Misfortune is applied.",
	"0xC121AB10" : "-2 Prestige from prestige leader. Their hand is discarded, all drawing decks are re-shuffled and the leader gets a new random full hand.",
	"0xC121AB11" : "Bounties to all heroes, add 2 King's Guard.",
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