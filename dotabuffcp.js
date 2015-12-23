
var DotaBuffCP = {

  VERSION: '0.6.1',

  initialized: false,

  initialize: function () {
    this.lineup = [ -1, -1, -1, -1, -1 ];
    this.initialized = true;
  },

  heroId: function (name) {

    for (var i in heroes)
      if (heroes[i].toLowerCase ().indexOf (name.toLowerCase ()) >= 0
        && heroes[i].length === name.length)
        return i;

    return -1;

  },

  heroAbbrLookup: {
    "abaddon": ["avernus"],
    "alchemist": ["razzil"],
    "ancient apparition": ["kaldr", "aa"],
    "anti-mage": ["am"],
    "axe": [],
    "bane": ["atropos"],
    "batrider": [],
    "beastmaster": ["karroch", "rexxar", "bm"],
    "bloodseeker": ["strygwyr", "bs"],
    "bounty hunter": ["gondar", "bh"],
    "brewmaster": ["mangix", "bm"],
    "bristleback": ["rigwarl", "bb"],
    "broodmother": ["bm"],
    "centaur warrunner": ["bradwarden", "cw"],
    "chaos knight": ["ck"],
    "chen": [],
    "clinkz": ["bone"],
    "clockwerk": ["rattletrap", "cw"],
    "crystal maiden": ["rylai", "cm"],
    "dark seer": ["ish", "ds"],
    "dazzle": [],
    "death prophet": ["krobelus", "grobulus", "dp"],
    "disruptor": [],
    "doom": [],
    "dragon knight": ["davion", "dk"],
    "drow ranger": ["traxex", "dr"],
    "earthshaker": ["raigor", "es"],
    "earth spirit": ["kaolin", "es"],
    "elder titan": ["et"],
    "ember spirit": ["xin", "es"],
    "enchantress": ["aiushtha"],
    "enigma": [],
    "faceless void": ["darkterror"],
    "gyrocopter": ["aurel"],
    "huskar": [],
    "invoker": ["kael", "karl", "carl"],
    "io": ["wisp"],
    "jakiro": ["thd"],
    "juggernaut": ["yurnero"],
    "keeper of the light": ["ezalor", "kotl"],
    "kunkka": [],
    "legion commander": ["tresdin", "lc"],
    "leshrac": [],
    "lich": ["ethreain"],
    "lifestealer": ["naix"],
    "lina": [],
    "lion": [],
    "lone druid": ["sylla", "ld"],
    "luna": [],
    "lycan": ["banehallow"],
    "magnus": [],
    "medusa": ["gorgon"],
    "meepo": ["geomancer"],
    "mirana": ["potm"],
    "morphling": [],
    "naga siren": ["slithice", "ns"],
    "natures prophet": ["furion", "np"],
    "necrophos": [],
    "night stalker": ["ns", "balanar"],
    "nyx assassin": ["na"],
    "ogre magi": ["aggron", "om"],
    "omniknight": ["ok"],
    "outworld devourer": ["od", "harbinger"],
    "phantom assassin": ["pa", "mortred"],
    "phantom lancer": ["azwraith", "pl"],
    "phoenix": [],
    "puck": [],
    "pudge": ["butcher"],
    "pugna": [],
    "queen of pain": ["akasha", "qop"],
    "razor": [],
    "riki": [],
    "rubick": [],
    "sand king": ["crixalis", "sk"],
    "shadow demon": ["sd"],
    "shadow fiend": ["nevermore", "sf"],
    "shadow shaman": ["rhasta", "ss"],
    "silencer": ["nortrom"],
    "skywrath mage": ["dragonus", "sm"],
    "slardar": [],
    "sniper": ["kardel"],
    "spectre": ["mercurial"],
    "spirit breaker": ["barathrum", "sb"],
    "storm spirit": ["raijin", "ss"],
    "sven": [],
    "techies": ["goblin","gt","sqee","spleen","spoon"],
    "templar assassin": ["lanaya", "ta"],
    "terrorblade": ["tb"],
    "tidehunter": ["leviathan"],
    "timbersaw": ["rizzrack"],
    "tinker": ["boush"],
    "tiny": [],
    "treant protector": ["rooftrellen"],
    "troll warlord": ["tw"],
    "tusk": ["ymir"],
    "undying": ["dirge"],
    "vengeful spirit": ["shendelzare", "vs"],
    "venomancer": ["lesale"],
    "visage": [],
    "warlock": ["demnok", "wl"],
    "weaver": ["skitskurr"],
    "windranger": ["lyralei", "wr"],
    "witch doctor": ["zharvakko", "wd"],
    "wraith king": ["ostarion", "skeleton king", "wk", "sk"],
    "zeus": []
  },

  checkHeroAbbr: function (hero, name) {

    var heroAbbr = this.heroAbbrLookup[hero.toLowerCase ()];

    if (_.isUndefined (name) || _.isUndefined (heroAbbr))
      return false;

    name = name.toLowerCase ();

    for (var i = 0; i < heroAbbr.length; ++i)
      if (heroAbbr[i].indexOf (name) >= 0)
        return true;

    return false;
  },

  listHeroes: function (name) {
    $('#hero-list').html ('');
    _.each (heroes, function (hero, key) {

      if (!_.isUndefined (name) &&
          !DotaBuffCP.checkHeroAbbr (hero, name) &&
          hero.toLowerCase ().indexOf (name.toLowerCase ()) < 0) {
        return;
      }

      if (!heroes_bg[key].match(/^http/)) {
        heroes_bg[key] = 'http://www.dotabuff.com/' + heroes_bg[key];
      }

      $('#hero-list').append (
        $('<li>').attr ('data-hero-id', key).html (
          $('<img>').attr ('src', heroes_bg[key])
        ).append (hero)
      );
    });
  },

  calculate: function () {

    var advantages = Array.apply (null, new Array (heroes.length))
                       .map (Number.prototype.valueOf, 0.0);

    for (var h in this.lineup) {

      var hid = this.lineup[h];

      if (hid == -1)
        continue;

      for (var i = 0; i < heroes.length; ++i) {
        if (_.isUndefined (win_rates[hid][i]) || _.isNull (win_rates[hid][i]))
          continue;
        advantages[i] += parseFloat (win_rates[hid][i][0]);
      }

    }

    return advantages;

  },

  generateLink: function () {

    var link = '#';

    for (var i in this.lineup) {
      if (this.lineup[i] == -1)
        link += '/';
      else
        link += heroes[this.lineup[i]] + '/';
    }

    link = link.replace (/ /g, '_');
    link = link.replace (/\/+$/, '');

    return link;
  },

  getVersion: function () {

    return this.VERSION + '.' + update_time;

  }

};



var MainView = Backbone.View.extend ({

  el: '#main-container',

  initialize: function () {
    this.$el.html (_.template ($('#main-view-template').html ()));
    DotaBuffCP.listHeroes ();
    $('#hero-search').focus ();
  },

  events: {
    'keyup #hero-search': 'heroSearch',
    'click #hero-search-reset': 'heroSearchReset',
    'click #hero-list li': 'addHero',
    'click div.lineup div.col-md-2 img': 'removeHero',
    'click #reset-all': 'resetAll',
    'submit form': function () { return false; }
  },

  heroSearch: function (ev) {
    // reset if Esc pressed
    if (ev.keyCode == 27) {
      $(ev.currentTarget).val ('');
      this.heroSearchReset ();
    }
    // add first hero if enter pressed
    else if (ev.keyCode == 13) {
      this.addFirstHero ();
    }

    else {
      DotaBuffCP.listHeroes ($(ev.currentTarget).val ());
    }

    return false;
  },

  heroSearchReset: function () {
    DotaBuffCP.listHeroes ();
  },

  switchLink: function () {
    var link = DotaBuffCP.generateLink ();
    location.href = link;
  },

  addFirstHero: function () {
    $('#hero-list li:first').trigger ('click');
  },

  addHero: function (ev) {
    var hid = $(ev.currentTarget).attr ('data-hero-id');
    var pick_i = -1;

    this.heroSearchReset ();
    $('#hero-search').val ('');
    $('#hero-search').focus ();

    for (var i in DotaBuffCP.lineup)
      if (DotaBuffCP.lineup[i] == hid)
        return;

    for (var i in DotaBuffCP.lineup) {
      if (DotaBuffCP.lineup[i] == -1) {
        pick_i = i;
        break;
      }
    }

    if (pick_i == -1)
      return;

    DotaBuffCP.lineup[pick_i] = hid;

    $('#hero-' + pick_i).html ($('<img>').attr ('src', heroes_bg[hid])
                                         .attr ('data-idx', pick_i));

    this.calculateAndShow ();
    this.switchLink ();
  },

  addHeroToIndex: function (hid, pick_i) {
    $('#hero-' + pick_i).html ($('<img>').attr ('src', heroes_bg[hid])
                                         .attr ('data-idx', pick_i));
  },

  removeHero: function (ev) {
    var i = $(ev.currentTarget).attr ('data-idx');
    DotaBuffCP.lineup[i] = -1;
    $('#hero-' + i).html ('');

    this.calculateAndShow ();
    this.switchLink ();
  },

  resetAll: function () {
    for (var i = 0; i < 5; ++i) {
      DotaBuffCP.lineup[i] = -1;
      $('#hero-' + i).html ('');
    }

    this.calculateAndShow ();
    this.switchLink ();
  },

  isEmpty: function () {
    for (var i in DotaBuffCP.lineup)
      if (DotaBuffCP.lineup[i] != -1)
        return false;
    return true;
  },

  showAdvantages: function (div, advantages) {
    var template = $('#counter-template').html ();
    $('#' + div).html ('');
    _.each (advantages, function (advantage, i) {

      for (var l in DotaBuffCP.lineup)
        if (advantage[1] == DotaBuffCP.lineup[l])
          return;

      $('#' + div).append (_.template (template, {
                                     hero_bg: heroes_bg[advantage[1]],
                                     hero_name: heroes[advantage[1]],
                                     win_rate: heroes_wr[advantage[1]],
                                     advantage: advantage[0].toFixed (2) * -1
                                                 }));
    });
  },

  calculateAndShow: function () {

    if (this.isEmpty ()) {
      $('div.lineup-title').show ();
      $('div.pick-title').hide ();
      $('#reset-all').hide ();
      $('#counters').hide ();
      return;
    } else {
      $('div.lineup-title').hide ();
      $('div.pick-title').show ();
      $('#reset-all').show ();
      $('#counters').show ();
    }

    var advantages = DotaBuffCP.calculate ();

    // lets add indexes (hero ids) first
    for (var i in advantages)
      advantages[i] = [advantages[i], i];

    advantages.sort (function (l, r) {
      return l[0] < r[0] ? -1 : 1;
    });

    this.showAdvantages ('best-picks',
                          advantages.slice (0, advantages.length / 2));

    this.showAdvantages ('worse-picks',
                          advantages.reverse ().slice (0, advantages.length / 2));

    $('#counters').scrollTop (0);
  }

});



var AppRouter = Backbone.Router.extend ({

  initialize: function () {
    this.route (/^(.*?)$/, 'sozdeHerolar');
    this.route (/^about$/, 'about');
  },

  sozdeHerolar: function (heroSelection) {
    if (DotaBuffCP.initialized)
      return;
    else
      DotaBuffCP.initialize ();

    var mainView = new MainView ();

    if (_.isNull (heroSelection))
      return;

    heroSelection = heroSelection.replace (/_/g, ' ');
    var selectedHeroes = heroSelection.split ('/');

    for (var i in selectedHeroes) {

      if (i > 4)
        break;

      if (_.isEmpty (selectedHeroes[i]))
        continue;

      var hid = DotaBuffCP.heroId (selectedHeroes[i]);

      if (hid == -1)
        continue;

      DotaBuffCP.lineup[i] = hid;
      mainView.addHeroToIndex (hid, i);
    }

    mainView.calculateAndShow ();
  },

  about: function () {
    $('#main-container').html (_.template ($('#about-page').html (),
                                           { version: DotaBuffCP.VERSION,
                                             last_update: update_time }));
    DotaBuffCP.initialized = false;
  }

});


$(document).ready (function () {
  // set version
  $('#version').text (DotaBuffCP.getVersion ());

  var appRouter = new AppRouter ();

  Backbone.history.start ({ pushState: false, root: '/dotabuffcp/' });
});
