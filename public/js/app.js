/***
*		Mujahid Maqsood
*		ID: 100939220
*
*		Front end javascript
*		
*		Handles rendering the game objects and going to the API to register user/fetch card info
*/

// Our API root that we talk to
var API_ROOT = 'http://localhost:2406';
var userId = '';
var guesses = 0;
$(document).ready(function() {
	// Get user name
    userId = promptUser();
    // Save user to the system
   	saveUser(userId, function(){
   		// Start game
   		setupGame();
   	});
});

/**
 *	Starts a new game for the user, setting the appropriate internal variables and handlers
 */
var setupGame = function() {
	// Reset guesses to 0
	guesses = 0;
	// Create the board again
	generateBoard();
	// Register handlers
	$('.card').on('click', onCardClick);
}
/**
 *	When a card is clicked we want to ask the server for the card value so we can determine
 *	if the user matched something
 */
var onCardClick = function(e) {
	// When two incorrect cards have been clicked, since we want the user to see the flip back,
	// the card grid will be disabled for a bit, and we don't want to trigger another click
	// before that process is complete 
	var isDisabled = $('#card-grid').data('disabled') === true;
	if (!isDisabled) {
		var $card = $(e.currentTarget);
		var rowIdx = $card.data('rowIdx');
		var colIdx = $card.data('colIdx');
		// Get the card value from the server
		getCardText(rowIdx, colIdx, function(cardValue){
			// Set card value
			$card.html(cardValue);
			// Flip the card for the user & check for matches
			activateCard($card);
		});
	}
}
/**
 *	This will flip a card for the user, changing its background color and then will
 *	check if the user has another flipped up card to make a potential match with. 
 *
 * 	This function will also check if the user has won the game.
 */
var activateCard = function($card) {
	// This is the other active card the user has clicked on
	var $currentActiveCard = $('.active:not(.matched)');
	// Flip current card
	$card.addClass('active');
	
	// We don't want to do any special logic if the user just clicked on the same flipped card
	// again
	if (!($card.is($currentActiveCard)) && $currentActiveCard.length > 0) {
		guesses++;
		var activeCardVal = $currentActiveCard.html();
		var currentCardVal = $card.html();
		if (activeCardVal === currentCardVal) {
			// Since both match, we'll add the matched class so we can exclude them from
			// future checks
			$currentActiveCard.addClass('matched');
			$card.addClass('matched');
			// Check winning condition by seeing if there are any cards left that are not matched
			var nonMatchedCards = $('#card-grid .card:not(.matched)');
			if (nonMatchedCards.length === 0) {
				// The reason we do a timeout here is becuase if we do an alert, the jquery
				// event won't be completed and the user won't see the final card being flipped
				setTimeout(function(){
					alert('You won with ' + guesses + ' guesses');
					// Restart game afer user clicks the ok button in the above alert
					setupGame();
				}, 100);
			}
		}
		else {
			// We mark this grid as disabled so we can prevent other clicks on cards until
			// these two cards are flipped back down
			$('#card-grid').data('disabled', true);
			setTimeout(function(){
				// We now need to flip the two cards that didn't match back down for the user
				$('#card-grid').data('disabled', false);
				$currentActiveCard.removeClass('active')
				$card.removeClass('active');
				$currentActiveCard.html('')
				$card.html('');
			}, 1000);
		}
	}
}
/**
 *	Pings the API to get the card value for a given card at a row index and a column index
 *
 * 	Since it's async, accepts a callback
 */
var getCardText = function(rowIdx, colIdx, done) {
	$.get(API_ROOT + '/memory/card', { 
		id: userId,
		rowIdx: rowIdx,
		cardIdx: colIdx
	}, done);
}

/**
 *	Generates the board with cards on each row, assumes a 4x4 grid
 */
var generateBoard = function() {
	var $table = $('#card-grid');
	$table.empty();
	for (var idx = 0; idx < 4; idx++) {
		var $row = $('<tr></tr>');
		appendCardDiv($row, idx);
		$table.append($row);
	}
}
/**
 *	Creates and appends 4 cards to a given row
 */
var appendCardDiv = function($row, rowIdx) {
	var $cardDiv = getCardDiv();
	$row.append(getCardDiv(rowIdx, 0));
	$row.append(getCardDiv(rowIdx, 1));
	$row.append(getCardDiv(rowIdx, 2));
	$row.append(getCardDiv(rowIdx, 3));
}
/**
 *	Creates a card div wrapped with a td and sets its data to be the card's current
 *	row and column index
 */
var getCardDiv = function(rowIdx, colIdx) {
	var $td = $('<td></td>');
	var $cardDiv = $('<div class="card"></div>');
	$cardDiv.data('row-idx', rowIdx);
	$cardDiv.data('col-idx', colIdx);
	$td.append($cardDiv);
	return $td;
}
/**
 *	Saves the current user in the server and creates a new game board for them
 */
var saveUser = function(id, done) {
	$.post(API_ROOT + '/memory/intro', { id: id }, function() {
	  done();
	});
}

/**
 *	Simply prompts the user for their name and defaults to Player if it isn't supplied
 */
var promptUser = function() {
	return prompt('Please enter your name') || 'Player';
}
