let language;
let theme;

let players;
let undercover;
let keyword;
let turns = [];

let currentTurn;

$(function() {
    $('#settings-btn').on('click', function(e) {
        $('#settings').addClass('show');
    });

    $('#settings-close').on('click', function(e) {
        $('#settings').removeClass('show');
    });

    $('#lang-select').on('change', function(e) {
        let lan_query = $(this).val();
        language = localization[lan_query];
        localize(language);
        applyUrlParams(language, theme);
    });

    $('#theme-select').on('change', function(e) {
        theme = $(this).val();
        themify(theme);
        applyUrlParams(language, theme);
    });

    window.onpopstate = function (e) {
        language = checkLanguage();
        theme = checkTheme();
        localize(language);
        themify(theme);
    }

    $('#back-btn').on('click', function(e) {
        $('#wrapper').removeClass('playing');
    });

    $('#players-less').on('click', function(e) {
        let p = $('#players-count').text();
        $('#players-count').text(Math.max(--p, 1));
    });

    $('#players-more').on('click', function(e) {
        let p = $('#players-count').text();
        $('#players-count').text(Math.max(++p, 1));
    });

    $('#undercover-less').on('click', function(e) {
        let c = $('#undercover-count').text();
        let p = $('#players-count').text();
        $('#undercover-count').text(Math.min(Math.max(--c, 1), p-1));
    });

    $('#undercover-more').on('click', function(e) {
        let c = $('#undercover-count').text();
        let p = $('#players-count').text();
        $('#undercover-count').text(Math.min(Math.max(++c, 1), Math.floor(p/2)));
    });

    $('#play-btn').on('click', function(e) {
        setupGame();
        startGame();
    });

    $('#toggle-word').on('click', function(e) {
        $('#current-word .text').toggleClass('show');
    });

    $('#next-turn').on('click', function(e) {
        makeTurn();
    });

    language = checkLanguage();
    theme = checkTheme();
    localize(language);
    themify(theme);
    applyUrlParams(language, theme);
    $('#wrapper').addClass('loaded');

    self.addEventListener('install', function(event) {
        event.waitUntil(
            caches.open(cacheName).then(function(cache) {
                return cache.addAll(
                    [
                        // Default theme icons
                        '/assets/img/add.svg',
                        '/assets/img/back.svg',
                        '/assets/img/gear.svg',
                        '/assets/img/minus.svg',

                        // Dark theme icons
                        '/assets/img/add-theme-dark.svg',
                        '/assets/img/back-theme-dark.svg',
                        '/assets/img/gear-theme-dark.svg',
                        '/assets/img/minus-theme-dark.svg',

                        // CSS
                        '/assets/css/main.min.css',

                        // JS
                        '/assets/js/jquery-3.3.1.min.js',
                        '/assets/js/util.min.js',
                        '/assets/js/words.min.js',
                        '/assets/js/localization.min.js',
                        '/assets/js/theming.min.js',
                        '/assets/js/main.min.js'
                    ]
                );
            })
        );
    });
    // self.addEventListener('fetch', function(event) {
    //     event.respondWith(
    //         caches.open('mysite-dynamic').then(function(cache) {
    //             return cache.match(event.request).then(function (response) {
    //                 return response || fetch(event.request).then(function(response) {
    //                     cache.put(event.request, response.clone());
    //                     return response;
    //                 });
    //             });
    //         })
    //     );
    // });
    self.addEventListener('fetch', function(event) {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    });
})

function setupGame() {
    // Get Values
    players = $('#players-count').text();
    undercover = $('#undercover-count').text();
    keyword = language['words'][generateRandomInt(0, language['words'].length)];
    turns = [];

    // Set turns
    let player_str = language['player'];

    for (let i = 1; i <= players; i++) {
        if (i == players) {
            turns.push({
                player: player_str + ' ' + i,
                under: false,
                word: keyword,
                next: language['search']
            });
        } else {
            turns.push({
                player: player_str + ' ' + i,
                under: false,
                word: keyword,
                next: player_str + ' ' + (i + 1)
            });
        }
    }

    // Set undercovers
    let under_indexes = [];

    for (let i = 0; i < undercover; i++) {
        let numberIsInArray = false;
        let rand = generateRandomInt(0, players);

        for(let j = 0; j < under_indexes.length; j++){
            if(rand === under_indexes[j]) {
                numberIsInArray = true;
                i--;
            }
        }

        if(!numberIsInArray){
            under_indexes.push(rand);
        }
    }

    for (let i of under_indexes) {
        turns[i].under = true;
        turns[i].word = language['title'];
    }

    // Add decide turn
    turns.push({
        player: language['decide'] + ' (' + undercover + ')',
        under: false,
        word: '',
        next: language['finish']
    });

    // Add solution
    let str = 'Solución: ' + turns[under_indexes[0]].player;
    for (let i = 1; i < under_indexes.length; i++) {
        str += ', ' + turns[under_indexes[i]].player;
    }
    turns.push({
        player: str,
        under: false,
        word: keyword,
        next: language['repeat']
    });
}

function startGame() {
    currentTurn = 0;
    makeTurn();
    $('#wrapper').addClass('playing');
}

function makeTurn() {
    $('#current-word .text').text('');
    $('#current-word .text').removeClass('show');

    let d = 10;
    if (currentTurn == turns.length) {
        d = 400;
        setupGame();
        currentTurn = 0;
    }

    setTimeout(function() {
        let current = turns[currentTurn];
        if (currentTurn === turns.length - 2) {
            // Solution
            $('#current-word').hide();
        } else {
            $('#current-word').show();

            if (currentTurn === turns.length - 1) {
                $('#current-word .text').addClass('show');
            }
        }

        let t = 400;
        if (currentTurn === 0)
            t = 20

        $('#play').animate({ opacity: 0 }, t, function() {
            $('#current-player').text(current['player']);
            $('#current-word .text').text(current['word']);
            $('#next-turn').text(current['next']);
        });

        setTimeout(function() {
            $('#play').animate({ opacity: 1 }, 400);
        }, t);
        currentTurn++;
    }, d);
}
