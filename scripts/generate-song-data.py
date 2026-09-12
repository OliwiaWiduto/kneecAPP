"""Generate provisional song modules from the checked-in Genius text captures."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp" / "genius"
DEST = ROOT / "data" / "songs"

SONGS = [
    ("fine-art", "Fine Art", 2024, "-b9GQ_nm9pc", "https://genius.com/Kneecap-fine-art-lyrics", 167, "Toddla T bounce and a mural that became a media circus — fine art, allegedly.", "fineArt"),
    ("fenian", "FENIAN", 2024, "PLDHQVJZuGQ", "https://genius.com/Kneecap-fenian-lyrics", 208, "Wear the slur as a chant until it stops drawing blood.", "fenian"),
    ("smugglers-and-scholars", "Smugglers & Scholars", 2024, "gHU5UJxRjxY", "https://genius.com/Kneecap-smugglers-and-scholars-lyrics", 172, "Saints, scholars, American dollars — internal matters only.", "smugglersAndScholars"),
    ("liars-tale", "Liars Tale", 2024, "e061Py8MTHg", "https://genius.com/Kneecap-liars-tale-lyrics", 210, "A story they keep telling about you — and the one you tell back.", "liarsTale"),
    ("no-comment", "No Comment", 2025, "ss9fRdpYdyI", "https://genius.com/Kneecap-no-comment-lyrics", 124, "Sub Focus drops and a section 13 storm — no comment.", "noComment"),
    ("sick-in-the-head", "Sick in the Head", 2019, "dDdnqCBPvFQ", "https://genius.com/Kneecap-sick-in-the-head-lyrics", 159, "West Belfast nights when the head's not right and the session won't quit.", "sickInTheHead"),
    ("its-been-ages", "It's Been Ages", 2018, "B8-_ogy-eGE", "https://genius.com/Kneecap-its-been-ages-lyrics", 152, "Long time no see — catch-ups, chaos, and the oul routine.", "itsBeenAges"),
    ("thart-agus-thart", "Thart agus Thart", 2018, "bI4QhEh-jk4", "https://genius.com/Kneecap-thart-agus-thart-lyrics", 146, "Round and round — Groundhog Day with Gaeilge in the mix.", "thartAgusThart"),
    ("amach-anocht", "Amach Anocht", 2018, "L9TJMrKpe0k", "https://genius.com/Kneecap-amach-anocht-lyrics", 252, "Out tonight — the plan, the punt, and the call for one more.", "amachAnocht"),
]

VOCAB = {
    "fine-art": [
        ("éist liom", "listen to me", "conversation", "aysht lum"),
        ("smaointí", "thoughts", "feeling", "SMEEN-chee"),
        ("mo dhícheall", "my best effort", "effort", "muh YEE-khul"),
        ("comhghairdeas", "congratulations", "greeting", "koh-GAR-jass"),
        ("is breá liom", "I love", "feeling", "iss braw lum"),
        ("ordaigh deoch", "order a drink", "night out", "OR-dee dyukh"),
        ("maith an fear", "good man", "greeting", "mah un far"),
        ("comhairle", "advice", "conversation", "KOH-ir-leh"),
    ],
    "fenian": [
        ("aréir", "last night", "time", "uh-RAYR"),
        ("Sasanach", "English person", "people", "SASS-uh-nukh"),
        ("san aer", "in the air", "place", "sun ayr"),
        ("aisteachas", "strangeness", "feeling", "ASH-chuh-khuss"),
        ("polaitíocht", "politics", "politics", "pul-ih-TEE-ukht"),
        ("amuigh ag damhsa", "out dancing", "night out", "uh-MWEE ag DOW-suh"),
        ("comhrá maith", "good conversation", "conversation", "KOH-raw mah"),
        ("Éire aontaithe", "united Ireland", "politics", "AY-ruh AYN-tuh"),
        ("fíorbhuíoch", "truly grateful", "thanks", "FEER-bwee-ukh"),
    ],
    "smugglers-and-scholars": [
        ("rialtas", "government", "politics", "REEL-tuss"),
        ("éirí amach", "uprising", "politics", "AY-ree uh-MOKH"),
        ("meas", "respect", "feeling", "mass"),
        ("daoine", "people", "people", "DEE-neh"),
        ("soilse gorma", "blue lights", "the city", "SIL-shuh GUR-muh"),
        ("sa tsráid", "in the street", "the city", "suh trawd"),
        ("mo phobal", "my community", "community", "muh FOH-bul"),
        ("cúpla focal", "a few words", "conversation", "KOOP-luh FUK-ul"),
    ],
    "liars-tale": [
        ("níor chóir", "should not", "politics", "neer khor"),
        ("maitheas", "goodness", "feeling", "MAH-huss"),
        ("ocras", "hunger", "feeling", "UK-russ"),
        ("sean-scéal", "old story", "stories", "shan shkayl"),
        ("ag iarraidh", "wanting / seeking", "feeling", "eg EER-uh"),
        ("cé muid féin", "who we are", "identity", "kay mwid fayn"),
        ("ar ais", "back", "coming and going", "air ash"),
        ("deireadh", "end", "time", "JER-uh"),
    ],
    "no-comment": [
        ("sílim", "I think", "feeling", "SHEEL-im"),
        ("éigeandáil", "emergency", "danger", "AY-gun-dawl"),
        ("aréir", "last night", "time", "uh-RAYR"),
        ("ag an bheár", "at the bar", "night out", "eg un vyair"),
        ("i bhfaiteadh na súl", "in the blink of an eye", "time", "ih VAT-uh nuh sool"),
        ("duine éigin", "someone", "people", "DIN-uh AY-gin"),
        ("níl mé cinnte", "I'm not sure", "feeling", "neel may KIN-cheh"),
        ("ag guí le Dia", "praying to God", "feeling", "eg gwee leh JEE-uh"),
    ],
    "sick-in-the-head": [
        ("tinn", "sick / tired", "feeling", "cheen"),
        ("comhairle", "advice", "conversation", "KOH-ir-leh"),
        ("cinneadh", "decision", "thinking", "KIN-uh"),
        ("dáinséarach", "dangerous", "danger", "DAWN-shay-rukh"),
        ("leadránach", "boring", "feeling", "LED-rawn-ukh"),
        ("as seo amach", "from now on", "time", "ass shuh uh-MOKH"),
        ("ar mire", "mad", "feeling", "air MIR-eh"),
        ("ar strae", "astray", "coming and going", "air stray"),
    ],
    "its-been-ages": [
        ("tá muid ar ais", "we are back", "coming and going", "taw mwid air ash"),
        ("is fada an lá", "it's a long time", "time", "iss FAH-duh un law"),
        ("de do chrá", "bothering you", "feeling", "deh duh khraw"),
        ("plean", "plan", "thinking", "plan"),
        ("sos", "break", "time", "suss"),
        ("an bua", "the victory", "politics", "un BOO-uh"),
        ("gach lá", "every day", "time", "gakh law"),
        ("drochmheasúil", "disrespectful", "feeling", "drukh-VASS-ool"),
    ],
    "thart-agus-thart": [
        ("thart agus thart", "round and round", "coming and going", "hart AG-us hart"),
        ("ag ól", "drinking", "night out", "eg ohl"),
        ("i rith an lae", "during the day", "time", "ih rih un lay"),
        ("tá mé gafa", "I am stuck", "feeling", "taw may GAH-fuh"),
        ("thíos", "down below", "place", "hees"),
        ("dúid mhór", "a big roll-up", "night out", "dood wohr"),
        ("thar barr", "excellent", "feeling", "har bar"),
        ("fear beag", "little man", "people", "far byug"),
    ],
    "amach-anocht": [
        ("amach anocht", "out tonight", "night out", "uh-MOKH uh-NUKHT"),
        ("do mhéar", "your finger", "the body", "duh vair"),
        ("do bheola", "your lips", "the body", "duh VYOH-luh"),
        ("cá bhfuil an dochar?", "where's the harm?", "conversation", "kaw wil un DUKH-ur"),
        ("mo mháthair", "my mother", "family", "muh WAW-hir"),
        ("ar buile", "furious", "feeling", "air BIL-eh"),
        ("ag cóisireacht", "partying", "night out", "eg KOH-shir-ukht"),
        ("buíochas le Dia", "thank God", "thanks", "BWEE-ukh-us leh JEE-uh"),
        ("ar aghaidh", "onward / ahead", "coming and going", "air uh-GHEE"),
    ],
}

# Phrase-level glosses used before smaller substitutions. Mixed lines retain their
# English wording while Irish phrases are made readable for provisional study.
GLOSSES = {
    "Éist liom, ná tar chugam le do chuid smaointí": "Listen to me, don't come to me with your thoughts",
    "Ná déan anailís ar mo chuid líntí (what?)": "Don't analyse my lines (what?)",
    "Comhghairdeas you're my new ghost writer": "Congratulations, you're my new ghost writer",
    "KNEECAP, is breá liom sibh": "KNEECAP, I love you all",
    "Ordaigh deoch sula labhrann cunt liom": "Order a drink before a cunt talks to me",
    "Mad one duit, a tharla aréir": "A mad one for you, that happened last night",
    "Bhuail mé le Sasanach, teannas san aer": "I met an Englishman, tension in the air",
    "Bhí sé giota beag aisteach": "He was a little strange",
    "No animosity ocht céad bliain": "No animosity, eight hundred years",
    "Mise 's na Fianna amuigh ag damhsa": "Me and the Fianna out dancing",
    "Éire aontaithe go luath?": "A united Ireland soon?",
    "Tógfaigh muid sup agus déarfaidh muid paidir": "We'll have a sup and say a prayer",
    "Tá mé fíorbhuíoch nár stad muid ag troid": "I'm truly grateful we never stopped fighting",
    "Agus buíochas le Dia gur Éireannaigh muid": "And thank God we're Irish",
    "Níl faic a dhéanann muidinne níos fearr": "Nothing makes us any better",
    "Scrios ar an rialtas ó bhun go barr": "Destroy the government from bottom to top",
    "Ar fad insa stair, éirí amach gach glúin": "Throughout history, an uprising every generation",
    "Ní luíonn muid síos ró-éasca, ciúin": "We don't lie down too easily or quietly",
    "Soilse gorma sa tsráid": "Blue lights in the street",
    "Is breá liom mo phobal": "I love my community",
    "Siúil taobh sráide, movements subtle": "Walk by the street, movements subtle",
    "Man of a few words Cúpla focal": "Man of a few words, a few words",
    "Níor chóir glacadh leis, níl maitheas ar bith": "It shouldn't be accepted, there's no good in it",
    "Ocras air arís, feeding overseas": "It's hungry again, feeding overseas",
    "Sean-scéal agus meirg air": "An old, rust-covered story",
    "Ag iarraidh aird agus cúpla punt": "Seeking attention and a few pounds",
    "Nach dtuigeann siad cé muid féin": "Don't they understand who we are?",
    "Ag iarraidh achan rud ar ais": "Wanting everything back",
    "Is tá deireadh le do ríocht, and that's a fact": "Your kingdom is over, and that's a fact",
    "Yes, Dan, sílim go bhfuil éigeandáil ann": "Yes, Dan, I think there's an emergency",
    "Mar aréir bhí mé fhéin is Mo Chara ag an bheár Vodka is rum": "Because last night Mo Chara and I were at the bar, vodka and rum",
    "I bhfaiteadh na súl ní raibh sé liom": "In the blink of an eye he wasn't with me",
    "Sílim gur fhuadaigh duine éigin é": "I think someone kidnapped him",
    "Níl mé cinnte déanta dul ar aghaidh": "I'm not sure what happened next",
    "Ag guí le Dia nach bhfuil se fíor ach ar maidin I've got fear": "Praying to God it isn't true, but in the morning I've got fear",
    "Tá mé tinn de bheith ag glacadh comhairle stráinséara": "I'm sick of taking a stranger's advice",
    "Mar tá an cinneadh a dhéanann daoine domsa dáinséarach": "Because decisions people make for me are dangerous",
    "Ag éirí leadránach, go síoraí ag caint cac’": "Getting boring, forever talking shit",
    "Níl mé dul a bheith ag éisteacht as seo amach": "I'm not going to listen from now on",
    "Gach seans go bhfuil mé giota beag ar mire": "There's every chance I'm a little mad",
    "Ar strae insa cheann, when we’re smoking": "Astray in the head when we're smoking",
    "Tá muid ar ais, your career we're saving": "We're back, your career we're saving",
    "Sin deireadh linn ar hiatus": "That's the end of our hiatus",
    "Is fada an lá, ó a bhí muid de do chrá": "It's been a long time since we were bothering you",
    "Go bhfuil muid ar ais le plean": "We're back with a plan",
    "Bhí sos againn, its been class": "We had a break; it's been class",
    "Gach lá ar an nuacht, bolscaireacht": "Every day on the news, propaganda",
    "Drochmheasúil mar a bhí": "As disrespectful as ever",
    "Gafa sa loop": "Stuck in the loop",
    "Thart agus thart": "Round and round",
    "Dúid mhór salach ansin tá mé thar barr": "A big dirty roll-up, then I'm flying",
    "Cuir do mhéar i do mhála": "Put your finger in your bag",
    "Mothaigh buzz ar do bheola": "Feel a buzz on your lips",
    "Caith siar cúpla buama": "Throw back a few bombs",
    "Is mura bhfuil cuid ar bith fágtha": "And if there isn't any left",
    "Faigh bump ó Mo Chara": "Get a bump from Mo Chara",
    "Goid fiche ó d’athair": "Steal twenty from your father",
    "Goid fiche ó d'athair": "Steal twenty from your father",
    "Sure, cá bhfuil an dochar?": "Sure, where's the harm?",
    "Mo mháthair ar buile mar nár ith mé mo lón": "My mother is furious because I didn't eat my lunch",
    "Ag súil le bheith ag cóisireacht le all na boys": "Hoping to party with all the boys",
    "Na lads ar bís tá muid ag dul ar an drabhlás": "The lads are excited; we're going on the tear",
    "Níl an RUC thart, buíochas le Dia": "The RUC aren't around, thank God",
    "Nuair a thagann siad gar liom, just rithim ar aghaidh": "When they come near me, I just run ahead",
}

GLOSSES.update(
    {
        "I know he’s a wee bit young, try to keep it from him, déanaimse mo dhícheall": "I know he’s a wee bit young, try to keep it from him; I do my best",
        "Aw here go raibh maith agat do do chomhairle críonna": "Aw here, thank you for your wise advice",
        "Cá raibh tusa nuair a thosaigh muid na blianta ó shin": "Where were you when we started years ago?",
        "Ag dul ar aghaidh faoi go bhfuil easpa collabs ag Kneecap, fuckin cuirigí ceol amach!": "Going on about Kneecap lacking collaborations—fucking release some music!",
    }
)

GLOSSES.update(
    {
        "Gach rud faoi shlóite na bhFiann": "Everything about the hosts of the Fianna",
        "Mo Chara an Phoblachtánach": "Mo Chara the Republican",
        "Cé hé seo? An fear beag dána": "Who's this? The cheeky little man",
        "Bandit, like a wee Western scannán": "Bandit, like a wee Western movie",
        "No more snaois all they want is polaitíocht": "No more snuff; all they want is politics",
        "Mind, stuff faoi an Ríocht Aontaithe": "Mind, stuff about the United Kingdom",
        "Buzzwords, headline go dtí go bhfuil sibh críochnaithe": "Buzzwords and headlines until you're all finished",
        "Tine chnámhna, get it doused up": "Bonfire, get it doused",
        "Cultúir tras-phobail is what we're about ach Gach sort cunt thart after me": "Cross-community culture is what we're about, but every kind of cunt is after me",
        "Cóta mór orm, Dick Dastardly": "A big coat on me, Dick Dastardly",
        "Goitse liomsa rachaidh muid dander": "Come with me, we'll go for a dander",
        "Cúpla jokes, sectarian banter": "A few jokes, sectarian banter",
        "Comhrá maith, caidreamh láidir?": "Good conversation, a strong relationship?",
        "Miotaseolaíocht , see I love all of that": "Mythology—see, I love all of that",
        "An Bradán Feasa , big lad Setanta": "The Salmon of Knowledge, big lad Setanta",
        "Seo an chaint 's tú ag cóisireacht": "This is the chat when you're partying",
        "Le KNEECAP, táimid lán de chac": "With KNEECAP, we're full of shit",
        "(Tiocfaidh ár lá ) Somebody sample that": "(Our day will come) Somebody sample that",
        "Glac ar ais muid Gleanntain Ghlas Ghaoth Dobhair": "Take us back to the green glens of Gweedore",
        "Le Rónán Mac Aodh Bhuí ag róstadh gabhar": "With Rónán Mac Aodh Bhuí roasting a goat",
        "In san áit ar thosaigh sé uilig": "In the place where it all started",
        "Chaill mé mo smig i dTeach Hiúdaí Bheag": "I lost my chin in Teach Hiúdaí Beag",
        "Ag an cabaret, in a good way": "At the cabaret, in a good way",
        "Signor Bari agus leath an chontae": "Signor Bari and half the county",
    }
)

GLOSSES.update(
    {
        "Mhúscail sibh an fathach": "You woke the giant",
        "Ní duine maslach mé , but I'm past that": "I'm not an insulting person, but I'm past that",
        "Ár n-athair atá lán de agro": "Our father, full of aggression",
        "Fág na cunts seo mar creatlach": "Leave these cunts as skeletons",
        "Níl mé ach ag magadh": "I'm only joking",
        "Embarrassed the police, the magistrates, the prosecution agus an bhreitheamh": "Embarrassed the police, the magistrates, the prosecution and the judge",
        "Tá do mháthair gafa liom freisin": "Your mother is obsessed with me too",
        "Calling mé sceimhleitheoir , never heard that said before": "Calling me a terrorist—never heard that said before",
        "Buíochas le dia gur luaigh sibh sin liom": "Thank God you mentioned that to me",
        "Insa cheantar seo you're gonna go far": "In this area you're going to go far",
        "Má léiríonn tú meas do na daoine ar fad": "If you show respect to all the people",
        "A tháinig romhat agus a d'imigh tríd slad": "Who came before you and endured slaughter",
        "A mhair tríd an ifreann thanks be to god": "Who lived through hell, thanks be to God",
        "'Cause na Sé Chontae was an awful slog": "Because the Six Counties were an awful slog",
        "Is muid an drúcht geal ceo ag cur i gcuimhne dó": "We are the bright dewy mist reminding him",
        "Go n-éiríonn an fhuiseog beo insa cheol": "That the lark comes alive in the music",
        "Éist, is gan dabht": "Listen, without a doubt",
        "Bhí muid fágtha le Cnoc an Anfa": "We were left with the Knock of the Storm",
        "This sé anuas and now we're laughing": "It came down and now we're laughing",
        "Cuirfidh muid glaoch ar na bais": "We'll call the boys",
        "Iad siúd atá i gceannas no lies": "Those who are in charge, no lies",
        "Anois tá teannas outside": "Now there's tension outside",
        "Ingearán thuas it's now doing laps": "A helicopter above, now doing laps",
        "Thart anseo níl trust do na cops": "Around here there's no trust for the cops",
        "Still keep my head down, suas le mo chochall": "Still keep my head down, hood up",
        "Siúil taobh sráide , movements subtle": "Walk by the street, movements subtle",
        "Cúpla focal": "A few words",
        "Seo Fenian gluaiseacht": "This is a Fenian movement",
        "Coinnigh gach rud druidte seachas cluasa": "Keep everything closed except your ears",
        "Joyriders déanamh scrios ar ghluaisteáin": "Joyriders wrecking cars",
        "Ceantar seo thuas seal, thíos seal": "This area is up one while, down the next",
        "Splinter groups ag an doras san oích'": "Splinter groups at the door at night",
    }
)

GLOSSES.update(
    {
        "Níor chóir glacadh leis, belly of the beast": "It shouldn't be accepted—the belly of the beast",
        "Tá mé tinn de bheith i gcónaí switched on": "I'm sick of always being switched on",
        "Chuig Rath Chairn ghlas na Mí": "To green Ráth Chairn in Meath",
        "Má fieiceann tú sa tsráid me there's nothin' to see": "If you see me in the street, there's nothing to see",
        "Agus pionta leann dubh that's a little bit of me": "And a pint of stout—that's a little bit of me",
        "Níl uaimse ach faic a dhéanamh just chill with the boys": "I only want to do nothing, just chill with the boys",
        "Ach bíonn orm dul ar stáitse , makin’ some noise": "But I have to go on stage, making some noise",
        "Ag déanamh post polaiteoir that they’re tryna avoid": "Doing a politician's job that they're trying to avoid",
        "Ní dhéanfaidh muid dearmad ar an lucht seo": "We won't forget this crowd",
        "Ní bheith sé ariamh nó anois mo mheon": "It was never and is not now my mindset",
        "No escaping it le feiceáil ar do phone": "No escaping it, visible on your phone",
        "Níl mise sásta suí ar mo thóin": "I'm not content to sit on my arse",
        "Ocras air arís , feeding overseas": "It's hungry again, feeding overseas",
        "Ag sú bod America": "Sucking America's dick",
        "Níl ionat ach tory, gléasta in Labour clothin'": "You're nothing but a Tory dressed in Labour clothing",
        "Na Sé Chontae and the artifacts , we'll be taking all that": "The Six Counties and the artefacts—we'll be taking all that",
        "Is tá deireadh le do ríocht , and that's a fact": "And your kingdom is over, and that's a fact",
        "(Is) cinnte go bhfuil muid sa bhealach": "We're certainly in the way",
        "Ag roinnt an fhírinne sa bhruach thíar agus Gaza": "Sharing the truth on the West Bank and in Gaza",
        "Sampla déanta duit anois so ciúnas Mo Chara": "An example has been made of you, so silence, Mo Chara",
        "Ní tharlóidh sin a riamh ná bí buartha tá mé a rá leat": "That will never happen—don't worry, I'm telling you",
        "Muscail suas ostán úr": "Wake up in a new hotel",
        "Caithfidh gur ól mé go leor do thriúr , pure": "I must have drunk enough for three people, pure",
        "Madness ar an TV, Kneecap i mbéal na TD's": "Madness on TV, Kneecap in the politicians' mouths",
        "Cleachtaithe lе sin at least , not with debates on BBC": "Used to that at least, but not debates on the BBC",
        "Buail isteach agallamh leis na péas but it's all voluntary": "Drop in for an interview with the police, but it's all voluntary",
        "Seans gur thóg na hIsraelis nó MI5 like b’fhéidir é": "Maybe the Israelis or MI5 took him",
    }
)

GLOSSES.update(
    {
        "Seasaigí, tú ar do ghlúine they’re doing it to ya constantly": "Stand up; you're on your knees, they're doing it to you constantly",
        "Fan socair, bí díograiseach is cloígh le do phlean mucker": "Stay calm, be determined and stick to your plan, mucker",
        "Gur seo do thriailse, do siaol atá ann , brother": "This is your trial, your life, brother",
        "Ní ligim don domhan mór riamh dul i bhfeidhm ar an fhíorshaol atá ar an taobh istigh": "I never let the wider world affect the real life inside",
        "To be affecting me because cibé rud atá le tarlú is always how it’s meant to be": "To affect me, because whatever is going to happen is always how it's meant to be",
        "So goitse, cogar, cloígh leat féin is ná héist le haon fucker": "So come here, a word: stick to yourself and don't listen to any fucker",
        "Ní thuigeann siad tusa mar a thuigeann tusa tusa": "They don't understand you the way you understand yourself",
        "Níor shiúil siad i do chosa": "They haven't walked in your shoes",
        "So tóg seans, seans go n-éireoidh sé níos fusa": "So take a chance; it may get easier",
        "Ní bheidh tú riamh sna sráideanna ach agatsa, beidh fadhbanna": "You'll never be on the streets, but you'll have problems",
        "You want this for náideanna sa bhreis when you’re paid?”": "You want this for extra zeros when you're paid?",
        "Níl aon dabht maidir liomsa is Mo Chara": "There's no doubt about me and Mo Chara",
        "Ar strae insa cheann , when we’re smoking": "Astray in the head when we're smoking",
        "Cuir i gcéill go bhfuil tu deas": "Pretend that you're nice",
        "I do shuí i do phálás": "Sitting in your palace",
        "Ach téimid ar fad i do phlámás": "But we all flatter you",
        "Téimid ar fad i do phlámás": "We all flatter you",
        "Achan uile rud ar shon do leas": "Everything for your own benefit",
        "Níos mò votaí sin do tiasc": "More votes—that's your task",
        "Ag ceangail rudaí nach bhfuil nasc...": "Connecting things that have no link",
        "Ach Mo Chara, why so cruel?": "But Mo Chara, why so cruel?",
        "Ach anois ó seo amach is linn an buacht": "But from now on the victory is ours",
        "Drochmieasúil mar a bhí": "As disrespectful as ever",
        "Ach i bhfad níos measa, wait and see": "But much worse—wait and see",
        "Goidé a chím tá tú ceangailte le cábla": "What do I see? You're tied with a cable",
        "A cöl veain bhean bán, le triúr fear ann i mbalaclava": "In the back of a white van with three men in balaclavas",
        "Goidé a tharlaíonn ansin": "What happens then?",
        "Píosa fada maith a deánfaidh muid as radharc": "We'll do a good long stretch out of sight",
    }
)

GLOSSES.update(
    {
        "Big skins , thíos ag an mini mart": "Big skins, down at the mini-mart",
        "Big skins, thíos ag an mini mart": "Big skins, down at the mini-mart",
        "Cosúil le mo mhéilteoir ya": "Like my grinder, yeah",
        "Lá eile cac céanna": "Another day, same shit",
        "'Dom an stuif, cuirfidh mé ceann le chéile": "Give me the stuff; I'll put one together",
        "Móglaí an tógalaí fáilte chuig an bráinse is úra glas de na hóglaigh": "Móglaí the builder—welcome to the newest green branch of the volunteers",
        "Ceithre uair is fichid": "Twenty-four hours",
        "Cead rud ar maidin agus mall in san oiche": "First thing in the morning and late at night",
        "Fuck all else le bheith déanamh thart anseo": "Fuck all else to do around here",
        "Anois ar ais chuig an siopa to get a pack of raws": "Now back to the shop to get a pack of Raws",
        "I miss love buzz hugs 'is ag ól mo chuid le festival thugs": "I miss love, buzz, hugs and drinking my share with festival thugs",
        "I mo mucked up guds, ag suppáil suds le random cunts": "In my messed-up gear, supping suds with random cunts",
    }
)

GLOSSES.update(
    {
        "Amach anocht 'is ní thig liom focan fanacht": "Out tonight and I fucking can't wait",
        "Micí Dainín ag teacht ar a bhealach": "Micí Dainín is on his way",
        "Fiche ceathair Carlsberg agus Gin 'n' Tonic": "Twenty-four Carlsbergs and gin and tonic",
        "Mar sin an dóigh gur maith, liomsa imeacht": "That's how I like to head out",
        "Mála mór raithní ag deireadh na hoíche": "A big bag of ferns at the end of the night",
        "Mar níor miaith leat teacht anuas gan aon rud a choíche": "Because you wouldn't want to come down with nothing, ever",
        "Guma i do bhéal is deas rud éigin a ithe": "Gum in your mouth; it's nice to have something to chew",
        "Is stopfaidh sé do ghiall a bheith go hiomlán scriosta": "And it'll stop your jaw being completely wrecked",
        "Cith agus cac sula dtosnaíonn faic": "A shower and a shit before anything starts",
        "Tunes sa chúlra, suas full whick": "Tunes in the background, turned fully up",
        "Do mhagairlí bearrtha, ciallaíonn sin do sack": "Your balls shaved—that means your sack",
        "Anois tá STI agam mar nach ndearna mé seic": "Now I have an STI because I didn't check",
        "Cnag ar an doras, \"Yes, Postman Ket.\"": "Knock at the door: “Yes, Postman Ket.”",
        "Trí chonsan agus guta is ní íocann muid VAT": "Three consonants and a vowel, and we don't pay VAT",
        "Ní ghearann muid an gear mar tá sin pure cat": "We don't cut the gear because that's pure rubbish",
        "Tugann muid amach strap mar is muid Kneecap": "We bring out a strap because we're Kneecap",
        "D’éírigh mé ar maidin, bhuel, ag deireadh an laa": "I got up in the morning—well, at the end of the day",
        "Ach sula bhfágaim an leabaí, spliff agus cupán tae": "But before I leave the bed, a spliff and a cup of tea",
        "Anois tá oíche mhór romham mar gheall ar inné": "Now I have a big night ahead because of yesterday",
        "Chuir mé mo DLA ar fad i dtreo MDMA": "I put all my DLA toward MDMA",
        "Díreach ar an ghúthan le Móglaí Bap": "Straight on the phone to Móglaí Bap",
        "\"Caidé an chraic?\" “Chlymidia.”": "“What's the craic?” “Chlamydia.”",
        "\"Cén dóigh a bhfuair tú an clap?\"": "“How did you get the clap?”",
        "Ná bac, mar tá muidinne ag dul amach anocht": "Never mind, because we're going out tonight",
        "Agus tá deich kilo cóc eile ag Móglaí Bap": "And Móglaí Bap has another ten kilos of coke",
    }
)

GLOSSES.update(
    {
        "Cuirim mo fóbhrístí orm": "I put on my underpants",
        "Thar mo biod mór gorm": "Over my big blue penis",
        "Is cuma liom faoin boladh, a fiad is go bhfuil siad tirim": "I don't care about the smell as long as they're dry",
        "Mar tá a fhios agat go gcuirim Mo bhod in achan uile gee": "Because you know I put my dick in every girl",
        "Is cuma liom go bhfuil d'athair ina Próvaí": "I don't care that your father is a Provie",
        "Beagnach ag an chóisir agus buzz orm cheana": "Nearly at the party and I'm buzzing already",
        "Is breá liom double-dropping buachaillí dána": "I love double-dropping, naughty boys",
        "Déan cinnte go bhfuil MD i do mhála": "Make sure there's MD in your bag",
        "Agus cloígh leis na treoireacha anois a leanas:": "And follow the instructions that come next",
        "Tá blas de chócaon go fóill i mo focan srón": "There's still a taste of cocaine in my fucking nose",
        "Ag caitheamh raithní sula focan bhfuair mé mo thóin": "Taking ferns before I even got my arse",
        "Stoned out ag amharc ar porn ar mo focan fón": "Stoned out watching porn on my fucking phone",
        "Tá mo bhrollach iontach teann ach tá mé ag dul go maith": "My chest is very tight but I'm doing fine",
        "De réir Bláthnaid Ní Chofaigh, tá mé i bhfad ró-óg": "According to Bláthnaid Ní Chofaigh, I'm far too young",
        "Ní raibh uaim ach dinnéar agus cúpla póg": "All I wanted was dinner and a few kisses",
        "Goodfellas pizza, yes ag ithe mar ríthe": "Goodfellas pizza, yes, eating like kings",
        "Ag an self-checkout ach ní íocaimid daofa": "At the self-checkout, but we don't pay for them",
        "Cúpla punt sa bhreis do na lads in Ibiza": "A few extra pounds for the lads in Ibiza",
        "Buidéal White Lighting le cuidiú leis an tart": "A bottle of White Lightning to help with the thirst",
        "Deoirín beag Bucky , cocktail ceart": "A little drop of Buckfast, a proper cocktail",
        "Suas to fuck, cúpla bump ins an leithreas": "Fucked up, a few bumps in the toilet",
    }
)

GLOSSES.update(
    {
        "Landáilte anois ach ní bhacaim leis an bhia": "Landed now, but I don't bother with food",
        "Ní fieicimse aon focan garda ar bith": "I don't see a single fucking guard",
        "Ach déanaigí seic síos in RTÉ": "But do a check down at RTÉ",
        "Mo Chara agus Móglaí Bap ag scriosadh na háite": "Mo Chara and Móglaí Bap wrecking the place",
        "Mar a dúirt mé cheana tá do diermfiúr báite": "As I said before, your sister is plastered",
        "Ach b’fhearr liom an tseanphit síos ag an biongó": "But I'd prefer the old woman down at the bingo",
        "Kneecap i gcónaí coinspóideach leis an lingo": "Kneecap always controversial with the lingo",
        "Craiceann agus eochar, Mícheál, mas é do thoil é": "Skin and a key, Mícheál, please",
        "Ag cur na buamaí le chéile, so go mbeidh siad réidh": "Putting the bombs together so they'll be ready",
        "Ag díol fiche ounce snaois is ag fáil an dól": "Selling twenty ounces of snuff and getting the dole",
        "Ag cur na pics ar insta, ansin ag fáil mo hole": "Putting the pics on Instagram, then getting my hole",
        "Is níl mé buartha faoi na cops fiú ag teacht i mo dhiaidh": "And I'm not worried even about the cops coming after me",
        "Déanaim seic ar mo ghear do aon PMA": "I check my gear for any PMA",
        "'Cause mura bhfuil tú cúramach, rachaidh tú ar strae!": "Because if you're not careful, you'll go astray!",
        "Faigh bump ó Mo chara": "Get a bump from Mo Chara",
    }
)

GLOSSES.update(
    {
        "C-E-A-R-T-A, you say it needs more Tiocfaidh ár Lá’s": "C-E-A-R-T-A, you say it needs more ‘Our day will come’",
        "\"Caidé an chraic ?\" “Chlymidia.”": "“What's the craic?” “Chlamydia.”",
        "'Cause mura bhfuil tú cúramach, rachaidh tú ar strae !": "Because if you're not careful, you'll go astray!",
        "[?] do mhamó faoina áit ag an tabla": "[?] your granny about her place at the table",
        "Ach i rith an amá, dhá harp déag agus mála Maradonna": "But during the day, twelve Harps and a bag of Maradona",
        "tá mé gafa sa loop": "I'm stuck in the loop",
        "Naíscoil an mhí seo": "nursery school this month",
        "Maith an fear": "Good man",
        "is breá liom do cheol": "I love your music",
        "nach dtiocfadh leat díriú isteach ar an ól": "couldn't you focus on the drinking",
        "An chaint seo ar fad ar na drugaí": "All this talk about the drugs",
        "is tá mé a rá leat ní mharfaidh tú i bhfad": "and I'm telling you that you won't live long",
    }
)

IRISH_MARKERS = re.compile(
    r"\b(?:ag|agus|ach|anois|anocht|ar|bhí|cá|caith|ceantar|comhrá|"
    r"cuir|cúpla|deireadh|éist|faigh|fear|gach|go|goidé|goitse|"
    r"is|m[áo]r|mise|mo|mothaigh|muid|ná|nach|níl|níor|orm|seo|"
    r"sibh|sin|sílim|tá|thart|tóg|uair|bhfuil)\b",
    re.IGNORECASE,
)


def lyric_source(song_id: str) -> Path:
    full = SOURCE / "full" / f"{song_id}.txt"
    if not full.exists():
        raise FileNotFoundError(f"Missing required full Genius capture: {full}")
    return full


def parse_lines(path: Path) -> list[str]:
    raw = path.read_text(encoding="utf-8").replace("\ufeff", "")
    result: list[str] = []
    seen_section = False
    for raw_line in raw.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if re.match(r"^\d+ Contributors", line) or line in {"Translations", "English", "Italiano"}:
            continue
        if " Lyrics" in line and not line.startswith("["):
            continue
        if line.startswith("[") and line.endswith("]"):
            seen_section = True
            continue
        if not seen_section:
            continue
        if result and re.fullmatch(r"[’”'\")]+", line):
            result[-1] += line
            continue
        # Genius annotation fragments sometimes begin in lowercase or after a
        # dangling conjunction. Rejoin only those clear continuations.
        if result and (
            line[:1].islower()
            or line.startswith((",", ")", "?", "!", "—"))
            or re.search(r"\b(?:and|agus|ach|is|or)$", result[-1], re.IGNORECASE)
            or result[-1].endswith(",")
            or result[-1].endswith(
                (
                    "go gcuirim",
                    "Deoirín beag",
                    "seic síos in",
                    "do aon",
                )
            )
        ):
            result[-1] = f"{result[-1]} {line}"
        else:
            result.append(line)
    return result


def gloss(line: str) -> str:
    clean = re.sub(r"\s+", " ", line).strip()
    translated = clean
    for ga, en in sorted(GLOSSES.items(), key=lambda item: len(item[0]), reverse=True):
        translated = translated.replace(ga, en)
    # English lines need no translation; Irish/mixed lines retain their wording
    # as a fallback rather than inventing meaning unsupported by the source.
    return translated


def q(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def render(song: tuple) -> tuple[str, int]:
    song_id, title, year, youtube, genius, duration, blurb, const_name = song
    lines = parse_lines(lyric_source(song_id))
    step = (duration - 16) / max(len(lines) - 1, 1)
    out = [
        'import type { Song } from "./types";',
        "",
        f"/** Lyrics from Genius: {genius} */",
        f"export const {const_name}: Song = {{",
        f"  id: {q(song_id)},",
        f"  title: {q(title)},",
        f"  year: {year},",
        f"  youtubeId: {q(youtube)},",
        f"  geniusUrl: {q(genius)},",
        f"  durationSec: {duration},",
        f"  blurb: {q(blurb)},",
        "  // Provisional evenly spaced timings; run lyric alignment before release.",
        "  lines: [",
    ]
    for index, line in enumerate(lines):
        start = round(8 + index * step, 2)
        out.append(f"    {{ startSec: {start}, ga: {q(line)}, en: {q(gloss(line))} }},")
    out.extend(["  ],", "  vocab: ["])
    for index, (ga, en, pack, pronunciation) in enumerate(VOCAB[song_id], 1):
        example_ga = ga[:1].upper() + ga[1:] + "."
        out.extend([
            "    {",
            f"      id: {q(f'{song_id}-{index}')},",
            f"      ga: {q(ga)},",
            f"      en: {q(en)},",
            f"      pack: {q(pack)},",
            f"      pronunciation: {q(pronunciation)},",
            f"      exampleGa: {q(example_ga)},",
            f"      exampleEn: {q(en[:1].upper() + en[1:] + '.')},",
            "    },",
        ])
    out.extend(["  ],", "};", ""])
    return "\n".join(out), len(lines)


if __name__ == "__main__":
    for metadata in SONGS:
        content, count = render(metadata)
        path = DEST / f"{metadata[0]}.ts"
        path.write_text(content, encoding="utf-8")
        print(f"{path.relative_to(ROOT)}: {count} lines")
